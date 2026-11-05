import { AiOutlineShoppingCart } from 'react-icons/ai';
import { FiShoppingBag } from 'react-icons/fi';
import { IoMdContacts } from 'react-icons/io';
import { IoHomeOutline } from "react-icons/io5";
import { MdVerifiedUser } from "react-icons/md";
import { RiContactsLine } from 'react-icons/ri';

export const links = [
  {
    title: 'Dashboard',
    links: [
      {
        name: 'adminHome',
        icon: <IoHomeOutline />,
      },
    ],
  },
  {
    title: 'Management',
    links: [
      {
        name: 'allProduct',
        icon: <FiShoppingBag />,
      },
      {
        name: 'orders',
        icon: <AiOutlineShoppingCart />,
      },
      {
        name: 'documentVerification',
        icon: <MdVerifiedUser />,
      },
      {
        name: 'vendorVehicleRequests',
        icon: <FiShoppingBag />,
      },
      {
        name: 'allUsers',
        icon: <RiContactsLine />,
      },
      {
        name: 'allVendors',
        icon: <IoMdContacts />,
      },
    ],
  },
];
