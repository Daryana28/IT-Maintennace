// fe\src\modules\itam\cdmb\hooks\useCmdb.js
import { useState, useCallback, useEffect } from "react";

export default function useCmdb(assetId) {
 const [relations, setRelations] = useState([]);
 const [impact, setImpact] = useState(null);
 const [loading, setLoading] = useState(false);

 const load = useCallback(async () => {
  if (!assetId) return;

  setLoading(true);

  try {
   // MOCK RELATIONS
   const mockRelations = [
    {
     type: "ASSET_TO_TICKET",
     target_name: "Ticket #INC-1023 - Printer error",
    },
    {
     type: "ASSET_TO_WORKORDER",
     target_name: "WO-2026-001 - Preventive Maintenance",
    },
    {
     type: "ASSET_TO_USER",
     target_name: "Assigned to: Finance Dept",
    },
    {
     type: "ASSET_TO_LOCATION",
     target_name: "Head Office - Floor 2",
    },
   ];

   // MOCK IMPACT
   const mockImpact = {
    criticality: "MEDIUM",
    affected_services: [
     "Finance Reporting",
     "Payroll System",
    ],
    dependency_level: 2,
    risk_score: 65,
   };

   setRelations(mockRelations);
   setImpact(mockImpact);
  } catch (e) {
   setRelations([]);
   setImpact(null);
  } finally {
   setLoading(false);
  }
 }, [assetId]);

 useEffect(() => {
  load();
 }, [load]);

 return {
  relations,
  impact,
  loading,
  reload: load,
 };
}