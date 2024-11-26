"use client";

import React, { useEffect } from "react";
import WelcomeScreenContainer from "../../../components/custom/home-manager/WelcomeScreenContainer";
import { useParams } from "next/navigation";
import ManagerForm from "../../../components/custom/blockrequest/ManagerForm";
import ManagerRequests from "../../../components/custom/schedulemanager/ManagerRequests";
import ManagerOptmisedTable from "../../../components/custom/ManagerOptimisedTable";

export default function Manager() {
  const params = useParams();
  const id = params.slug;

  useEffect(() => {
    console.log(id);
  }, []);

  if (id[1] === "create-request") {
    return <ManagerForm />;
  } else if (id[1] === "requests") {
    return <ManagerRequests id={id[0]} />;
  } else if (id[1] === "optimised") {
    return <ManagerOptmisedTable id={id[0]} />;
  } else {
    return <WelcomeScreenContainer />;
  }
}
