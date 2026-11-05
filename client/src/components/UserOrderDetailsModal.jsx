import { useDispatch, useSelector } from "react-redux";
import { setIsOrderModalOpen } from "../redux/user/userSlice";

const UserOrderDetailsModal = () => {
  const { isOrderModalOpen, singleOrderDetails: cur } = useSelector(
    (state) => state.user
  );





  const dispatch = useDispatch();

  const pickupDate = cur?.bookingDetails?.pickupDate
    ? new Date(cur.bookingDetails.pickupDate)
    : new Date();
  const dropOffDate = cur?.bookingDetails?.dropOffDate
    ? new Date(cur.bookingDetails.dropOffDate)
    : new Date();

  

  const closeModal = () => {
    dispatch(setIsOrderModalOpen(false));
  };
  return (
    <>
      {isOrderModalOpen ? (
        <div
          className={` fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-black bg-opacity-60 opacity-100 backdrop-blur-sm transition duration-300  ease-in-out overflow-scroll`}
          onClick={closeModal}
        >
          <div className=" relative m-4 mx-auto  min-w-[300px] md:min-w-[500px] max-w-[40%]  rounded-lg bg-white font-sans text-base font-light leading-relaxed text-blue-gray-500 antialiased shadow-2xl">
            <div className="relative pt-10 p-4 antialiased capitalize font-medium text-[10px] md:text-[16px] ">
              <div className="mb-4 ">
                <div className="mb-2 font-bold">Booking Details</div>
                <hr></hr>
                <div className="mb-4 mt-2">
                  <div className="flex items-center  justify-between">
                    <div>Booking Id</div>
                    <div>{cur?.bookingDetails?._id || "-"}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Total Amount</div>
                    <div>₹{cur?.bookingDetails?.totalPrice || "0"}</div>
                  </div>
                  <div className="flex items-center justify-between mt-2 ">
                    <div>Pickup Location</div>
                    <div>{cur?.bookingDetails?.pickUpLocation || "-"}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Pickup Date</div>
                    <div>
                      <span>{pickupDate.toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>Pickup Time</div>
                    <div>
                      <span>
                        {String(pickupDate.getHours()).padStart(2, "0")}:
                        {String(pickupDate.getMinutes()).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>Dropoff Location</div>
                  <div>{cur?.bookingDetails?.dropOffLocation || "-"}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div>Dropoff Date</div>
                  <div>
                    <span>{dropOffDate.toLocaleDateString("en-IN")}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>Dropoff Time</div>
                  <div>
                    <span>
                      {String(dropOffDate.getHours()).padStart(2, "0")}:
                      {String(dropOffDate.getMinutes()).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 font-bold">Document Verification</div>
              <hr className="mt-2 mb-3" />
              <div className="flex items-center justify-between">
                <div>Verification Status</div>
                <div className="font-bold capitalize text-blue-600">
                  {cur?.bookingDetails?.verificationStatus || "Pending"}
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div>Document Status</div>
                <div className="capitalize">{cur?.bookingDetails?.documentStatus || "Not Submitted"}</div>
              </div>
              {cur?.bookingDetails?.rejectionReason && (
                <div className="flex items-center justify-between mt-1 text-red-600">
                  <div>Rejection Reason</div>
                  <div className="text-right text-xs max-w-[200px]">{cur?.bookingDetails?.rejectionReason}</div>
                </div>
              )}

              <div className="mt-4 font-bold">Vehicle Details</div>
              <hr className="mt-2 mb-3" />
              <div className="flex items-center justify-between">
                <div>Vehicle Number</div>
                <div className="font-mono font-bold text-blue-700">{cur?.vehicleDetails?.registeration_number || "-"}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Model</div>
                <div>{cur?.vehicleDetails?.model || "-"}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Company</div>
                <div>{cur?.vehicleDetails?.company || "-"}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Vehicle Type</div>
                <div>{cur?.vehicleDetails?.car_type || "-"}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Seats</div>
                <div>{cur?.vehicleDetails?.seats || "-"} Seater</div>
              </div>

              <div className="flex items-center justify-between">
                <div>Fuel Type</div>
                <div className="capitalize">{cur?.vehicleDetails?.fuel_type || "-"}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Transmission</div>
                <div className="capitalize">{cur?.vehicleDetails?.transmition || "-"}</div>
              </div>
              <div className="flex items-center justify-between">
                <div>Manufacturing Year</div>
                <div>{cur?.vehicleDetails?.year_made || "-"}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end p-4 shrink-0 text-blue-gray-500">
              <button
                className="middle none center rounded-lg bg-gradient-to-tr from-green-600 to-green-400 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-green-500/20 transition ease-in-out duration-300 hover:shadow-lg hover:shadow-green-500/40 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none animate-bounce hover:animate-none"
                onClick={closeModal}
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute top-0"></div>
      )}
    </>
  );
};

export default UserOrderDetailsModal;
