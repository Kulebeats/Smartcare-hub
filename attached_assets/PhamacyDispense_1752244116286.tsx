import ClientDetailsCard from "@/components/core/card/ClientDetailsCard";
import PharmacyDispenseDetails from "@/components/pharmacy/PharmacyDispenseDetails";
import DataSummaryList from "@/components/shared/data-summary/DataSummaryList";
import useWindowWidth from "@/hooks/shared/useWindow";

const PhamacyDispense = () => {
  const w768 = useWindowWidth(768);

  return (
    <div>
      <div className=" ">
        <ClientDetailsCard />
      </div>
      {w768 && (
        <div className=" sm:col-span-full mt-5 mr-3 md:col-span-1">
          <DataSummaryList isResponsive />
        </div>
      )}
      <div className=" grid md:grid-cols-4   ">
        <div className=" sm:col-span-full  md:col-span-3">
          <PharmacyDispenseDetails />
        </div>
        {!w768 && (
          <div className=" sm:col-span-full mt-5 mr-3 md:col-span-1">
            <DataSummaryList />
          </div>
        )}
      </div>
    </div>
  );
};

export default PhamacyDispense;
