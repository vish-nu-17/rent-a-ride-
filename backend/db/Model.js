import { randomUUID } from "crypto";
import { db } from "./postgres.js";

const registry = new Map();

function parseData(row) {
  const data = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
  return { ...data, _id: row.id };
}

function getPath(doc, path) {
  if (path == null) return undefined;
  return String(path)
    .replace(/^\$/, "")
    .split(".")
    .reduce((acc, key) => (acc == null ? acc : acc[key]), doc);
}

function looseEq(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return a == b;
  if (typeof a === "object" && a.id) a = a.id;
  if (typeof b === "object" && b.id) b = b.id;
  return String(a) === String(b);
}

function toTime(value) {
  if (value instanceof Date) return value.getTime();
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? Number(value) : time;
}

function compareOp(fieldValue, op, expected) {
  switch (op) {
    case "$eq":
      return looseEq(fieldValue, expected);
    case "$ne":
      return !looseEq(fieldValue, expected);
    case "$in":
      return Array.isArray(expected) && expected.some((item) => looseEq(fieldValue, item));
    case "$nin":
      return Array.isArray(expected) && !expected.some((item) => looseEq(fieldValue, item));
    case "$lt":
      return toTime(fieldValue) < toTime(expected);
    case "$lte":
      return toTime(fieldValue) <= toTime(expected);
    case "$gt":
      return toTime(fieldValue) > toTime(expected);
    case "$gte":
      return toTime(fieldValue) >= toTime(expected);
    default:
      return looseEq(fieldValue, { [op]: expected });
  }
}

function matchQuery(doc, query = {}) {
  return Object.entries(query).every(([key, value]) => {
    if (key === "$or") return value.some((part) => matchQuery(doc, part));
    if (key === "$and") return value.every((part) => matchQuery(doc, part));
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      Object.keys(value).some((op) => op.startsWith("$"))
    ) {
      return Object.entries(value).every(([op, expected]) =>
        compareOp(getPath(doc, key), op, expected)
      );
    }
    return looseEq(getPath(doc, key), value);
  });
}

function evalExpr(expr, doc) {
  if (expr === "$$ROOT") return doc;
  if (typeof expr === "string" && expr.startsWith("$")) return getPath(doc, expr.slice(1));
  if (expr && typeof expr === "object" && !Array.isArray(expr)) {
    if ("$arrayElemAt" in expr) {
      const [listExpr, index] = expr.$arrayElemAt;
      const list = evalExpr(listExpr, doc) || [];
      return list[index];
    }
    if ("$size" in expr) return (evalExpr(expr.$size, doc) || []).length;
    if ("$gt" in expr) {
      const [left, right] = expr.$gt.map((part) => evalExpr(part, doc));
      return left > right;
    }
    if ("$cond" in expr) {
      const cond = expr.$cond;
      return evalExpr(cond.if, doc)
        ? evalExpr(cond.then, doc)
        : evalExpr(cond.else, doc);
    }
    const result = {};
    for (const [key, value] of Object.entries(expr)) {
      result[key] = evalExpr(value, doc);
    }
    return result;
  }
  return expr;
}

function projectDoc(doc, spec) {
  const result = {};
  const includeId = spec._id !== 0 && spec._id !== false;
  if (includeId) result._id = doc._id;
  for (const [key, value] of Object.entries(spec)) {
    if (key === "_id") continue;
    result[key] = evalExpr(value, doc);
  }
  return result;
}

function groupDocs(docs, spec) {
  const groups = new Map();
  for (const doc of docs) {
    const groupId = evalExpr(spec._id, doc);
    const key = JSON.stringify(groupId);
    if (!groups.has(key)) groups.set(key, { _id: groupId, docs: [] });
    groups.get(key).docs.push(doc);
  }
  return [...groups.values()].map((group) => {
    const out = { _id: group._id };
    for (const [field, acc] of Object.entries(spec)) {
      if (field === "_id") continue;
      if (acc && acc.$push) {
        out[field] = group.docs.map((doc) => evalExpr(acc.$push, doc));
      }
    }
    return out;
  });
}

function cleanUpdate(update = {}) {
  const payload = update.$set ? { ...update.$set } : { ...update };
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) delete payload[key];
  });
  return payload;
}

function duplicateError(field, value) {
  const error = new Error("duplicate key");
  error.code = 11000;
  error.keyPattern = { [field]: 1 };
  error.keyValue = { [field]: value };
  return error;
}

function wrapError(error) {
  const message = String(error?.message || error);
  if (message.toLowerCase().includes("unique") || message.toLowerCase().includes("duplicate")) {
    error.code = 11000;
    error.keyPattern = { email: 1 };
    error.keyValue = { email: "already exists" };
  }
  throw error;
}

class Query {
  constructor(executor) {
    this.executor = executor;
  }

  lean() {
    return this.executor();
  }

  then(resolve, reject) {
    return this.executor().then(resolve, reject);
  }
}

function toDocument(model, data) {
  const doc = {
    ...data,
    _id: data._id,
    _doc: data,
    toObject() {
      return { ...data };
    },
    async save() {
      return model.saveDoc(data);
    },
  };
  return doc;
}

export class Model {
  constructor(collectionName) {
    this.collectionName = collectionName;
    registry.set(collectionName, this);
  }

  async allDocs() {
    const result = await db.query(`SELECT id, data FROM ${this.collectionName}`);
    return result.rows.map(parseData);
  }

  find(filter = {}, projection) {
    return new Query(async () => {
      let docs = (await this.allDocs()).filter((doc) => matchQuery(doc, filter));
      if (projection) {
        const fields = Object.keys(projection).filter((key) => projection[key]);
        docs = docs.map((doc) => {
          const next = { _id: doc._id };
          fields.forEach((field) => {
            next[field] = doc[field];
          });
          return next;
        });
      }
      return docs;
    });
  }

  findOne(filter = {}) {
    return new Query(async () => {
      const docs = await this.find(filter);
      const first = docs[0];
      return first ? toDocument(this, first) : null;
    });
  }

  async findById(id) {
    const realId = id && typeof id === "object" ? id._id || id.id : id;
    if (!realId) return null;
    const result = await db.query(
      `SELECT id, data FROM ${this.collectionName} WHERE id = $1`,
      [String(realId)]
    );
    if (!result.rows[0]) return null;
    return toDocument(this, parseData(result.rows[0]));
  }

  async saveDoc(data) {
    const now = new Date().toISOString();
    const id = data._id || randomUUID();
    const payload = {
      ...data,
      _id: id,
      createdAt: data.createdAt || now,
      updatedAt: now,
    };
    const existing = await db.query(
      `SELECT id FROM ${this.collectionName} WHERE id = $1`,
      [id]
    );
    try {
      if (existing.rows[0]) {
        await db.query(
          `UPDATE ${this.collectionName} SET data = $2::jsonb WHERE id = $1`,
          [id, JSON.stringify(payload)]
        );
      } else {
        await db.query(
          `INSERT INTO ${this.collectionName} (id, data) VALUES ($1, $2::jsonb)`,
          [id, JSON.stringify(payload)]
        );
      }
    } catch (error) {
      wrapError(error);
    }
    return toDocument(this, payload);
  }

  async create(data) {
    return this.saveDoc(data);
  }

  async insertMany(items) {
    const saved = [];
    for (const item of items) {
      saved.push(await this.saveDoc(item));
    }
    return saved;
  }

  async updateOne(filter, update) {
    const docs = await this.find(filter);
    if (!docs[0]) return { matchedCount: 0, modifiedCount: 0 };
    const next = { ...docs[0], ...cleanUpdate(update), updatedAt: new Date().toISOString() };
    await this.saveDoc(next);
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async findOneAndUpdate(filter, update, options = {}) {
    const docs = await this.find(filter);
    if (!docs[0]) return null;
    const next = { ...docs[0], ...cleanUpdate(update), updatedAt: new Date().toISOString() };
    const saved = await this.saveDoc(next);
    return options.new === false ? toDocument(this, docs[0]) : saved;
  }

  async findByIdAndUpdate(idOrFilter, update, options = {}) {
    const id =
      typeof idOrFilter === "object"
        ? idOrFilter._id || idOrFilter.id
        : idOrFilter;
    return this.findOneAndUpdate({ _id: String(id) }, update, options);
  }

  async findByIdAndDelete(id) {
    const doc = await this.findById(id);
    if (!doc) return null;
    await db.query(`DELETE FROM ${this.collectionName} WHERE id = $1`, [
      String(id),
    ]);
    return doc;
  }

  async aggregate(pipeline = []) {
    let docs = await this.allDocs();
    for (const stage of pipeline) {
      if (stage.$match) {
        docs = docs.filter((doc) => matchQuery(doc, stage.$match));
      } else if (stage.$lookup) {
        const foreign = registry.get(stage.$lookup.from);
        const foreignDocs = foreign ? await foreign.allDocs() : [];
        docs = docs.map((doc) => ({
          ...doc,
          [stage.$lookup.as]: foreignDocs.filter((item) =>
            looseEq(getPath(doc, stage.$lookup.localField), item[stage.$lookup.foreignField])
          ),
        }));
      } else if (stage.$unwind) {
        const path = String(stage.$unwind.path || stage.$unwind).replace(/^\$/, "");
        const next = [];
        for (const doc of docs) {
          const values = getPath(doc, path);
          if (Array.isArray(values) && values.length) {
            values.forEach((value) => next.push({ ...doc, [path]: value }));
          }
        }
        docs = next;
      } else if (stage.$group) {
        docs = groupDocs(docs, stage.$group);
      } else if (stage.$project) {
        docs = docs.map((doc) => projectDoc(doc, stage.$project));
      } else if (stage.$replaceRoot) {
        docs = docs.map((doc) => evalExpr(stage.$replaceRoot.newRoot, doc));
      } else if (stage.$sort) {
        const [[field, direction]] = Object.entries(stage.$sort);
        docs = [...docs].sort((a, b) => {
          const left = getPath(a, field);
          const right = getPath(b, field);
          if (left === right) return 0;
          return left > right ? direction : -direction;
        });
      } else if (stage.$limit) {
        docs = docs.slice(0, stage.$limit);
      }
    }
    return docs;
  }
}

export default function createModel(collectionName) {
  const model = new Model(collectionName);
  function Document(data = {}) {
    const payload = { ...data, _id: data._id || randomUUID() };
    return toDocument(model, payload);
  }
  Document.find = (...args) => model.find(...args);
  Document.findOne = (...args) => model.findOne(...args);
  Document.findById = (...args) => model.findById(...args);
  Document.create = (...args) => model.create(...args);
  Document.insertMany = (...args) => model.insertMany(...args);
  Document.updateOne = (...args) => model.updateOne(...args);
  Document.findOneAndUpdate = (...args) => model.findOneAndUpdate(...args);
  Document.findByIdAndUpdate = (...args) => model.findByIdAndUpdate(...args);
  Document.findByIdAndDelete = (...args) => model.findByIdAndDelete(...args);
  Document.aggregate = (...args) => model.aggregate(...args);
  return Document;
}
