import MasterData from "../../models/masterDataModel.js";
import { errorHandler } from "../../utils/error.js";
import { dummyData } from "../../db/seedData.js";

export async function insertDummyData(req, res, next) {
  try {
    await MasterData.insertMany(dummyData);
    console.log("Dummy data inserted successfully.");
    if (res) {
      res.status(200).json({ message: "Dummy data inserted successfully." });
    }
  } catch (error) {
    console.error("Error inserting dummy data:", error);
    if (next) next(errorHandler(500, "Error inserting dummy data"));
  }
}

export const getCarModelData = async (req, res, next) => {
  try {
    const availableVehicleModels = await MasterData.find();
    if (!availableVehicleModels) {
      return next(errorHandler(404, "no model found"));
    }
    res.status(201).json(availableVehicleModels);
  } catch (error) {
    next(errorHandler(500, { "could not get model Data": error }));
  }
};
