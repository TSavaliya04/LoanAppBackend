"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import { US_STATES } from "@/api/models/BorrowerPortalDraftTypes";
import { BackRow, BoundSelect, BoundTextField, FInput, PrimaryBtn, Req } from "./primitives";

const stateOptions = US_STATES.map((s) => ({ value: s, label: s }));

/* Step 5 SE – Business Contact & Address */
const Step5SE = ({ onNext, onBack }: { onNext: () => void; onBack: () => void }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
    <BackRow onBack={onBack} />
    <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "text.primary" }}>
      Business Contact &amp; Address
    </Typography>

    {/* Work phone + Ext */}
    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
      <Box sx={{ flex: 1 }}>
        <FInput
          label={<>Work Phone <Req /></>}
          placeholder="(562) 555-9876"
          name="selfEmployment.businessContact.workPhone"
          phone
        />
      </Box>
      <BoundTextField
        name="selfEmployment.businessContact.phoneExtension"
        size="small"
        placeholder="Ext."
        sx={{ width: 70, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.85rem" } }}
      />
    </Box>

    {/* Business Address */}
    <Box sx={{ width: "100%" }}>
      <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 0.5 }}>
        Business Address <Req />
      </Typography>
      <BoundTextField
        name="selfEmployment.businessContact.businessAddress"
        fullWidth
        size="small"
        placeholder="1234 Coastal Hwy"
        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.9rem" }, mb: 1 }}
      />
      {/* City / State / ZIP row */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Box sx={{ flex: 2 }}>
          <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", mb: 0.4 }}>City <Req /></Typography>
          <BoundTextField
            name="selfEmployment.businessContact.city"
            fullWidth
            size="small"
            placeholder="Long Beach"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.88rem" } }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", mb: 0.4 }}>State <Req /></Typography>
          <BoundSelect
            fullWidth
            name="selfEmployment.businessContact.state"
            options={stateOptions}
            sx={{ borderRadius: "8px", fontSize: "0.88rem" }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", mb: 0.4 }}>ZIP <Req /></Typography>
          <BoundTextField
            name="selfEmployment.businessContact.zip"
            fullWidth
            size="small"
            placeholder="90813"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.88rem" } }}
          />
        </Box>
      </Box>
    </Box>

    <PrimaryBtn onClick={onNext}>Continue</PrimaryBtn>
  </Box>
);

export default Step5SE;
