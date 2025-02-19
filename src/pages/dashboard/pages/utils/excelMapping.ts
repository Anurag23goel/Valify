export interface JsonToExcelMapping {
  Inputs: {
    valuerType: string;
    clientName: string;
    valuerName: string;
    purpose: string;
    premise: string;
    draftNote: string;
    projectTitle: string;
    subjectCompanyName: string;
    shortName: string;
    nextFiscalYearEndDate: string;
    valuationDate: string;
    ytd: string;
    ytgApproach: string;
    informationCurrency: string;
    presentationCurrency: string;
    units: string;
    industryPrimaryBusiness: string;
    subindustryPrimaryBusiness: string;
    primaryBusiness: string;
    primaryBusinessDescription: string;
    primaryRegions: string;
    otherRegions: string; // Range of cells
    industrySecondaryBusiness: string;
    subindustrySecondaryBusiness: string;
    secondaryBusiness: string;
    secondaryBusinessDescription: string;
    secondaryRegions: string;
    otherOperatingRegionsSecondary: string; // Multiple cells (e.g., D71, D72, D73)
    avgAnnualRevenue: string;
    developmentPhase: string;
    existingStream1: string;
    existingStream2: string;
    existingStream3: string;
    existingStream4: string;
    pipelineStream1: string;
    pipelineStream2: string;
    pipelineStream3: string;
    pipelineStream4: string;
    potentialStream1: string;
    potentialStream2: string;
    potentialStream3: string;
    potentialStream4: string;
    potentialStream1Probability: string;
    potentialStream2Probability: string;
    potentialStream3Probability: string;
    potentialStream4Probability: string;
    existingStreamsPrice: string;
    existingStreamsVolume: string;
    existingStreamsPriceGrowth: string;
    existingStreamsContribution: string;
    existingStreamsGrossMargin: string;
    pipelineStreamsGrossMargin: string;
    potentialStreamsGrossMargin: string;
    tradeReceivablesDays: string;
    otherReceivablesDays: string;
    inventoryDays: string;
    prepaidExpensesDays: string;
    tradePayablesDays: string;
    salariesPayableDays: string;
    accruedExpensesDays: string;
    taxPayablesDays: string;
    otherPayablesDays: string;
    CashasatValuationDate: string;
    Loans: string;
  };
}

export const jsonToExcelMapping: JsonToExcelMapping = {
  Inputs: {
    valuerType: "E18",
    clientName: "E19",
    valuerName: "E20",
    purpose: "E21",
    premise: "E22",
    draftNote: "E23",
    projectTitle: "E26",
    subjectCompanyName: "E24",
    shortName: "E25",
    nextFiscalYearEndDate: "E30",
    valuationDate: "E29",
    ytd: "E33",
    ytgApproach: "E36",
    informationCurrency: "E43",
    presentationCurrency: "E44",
    units: "E46",
    industryPrimaryBusiness: "E52",
    subindustryPrimaryBusiness: "E53",
    primaryBusiness: "E54",
    primaryBusinessDescription: "E55",
    primaryRegions: "E56",
    otherRegions: "D59-D61",
    industrySecondaryBusiness: "E63",
    subindustrySecondaryBusiness: "E64",
    secondaryBusiness: "E65",
    secondaryBusinessDescription: "E66",
    secondaryRegions: "E67",
    otherOperatingRegionsSecondary: "D71-D73",
    avgAnnualRevenue: "E49",
    developmentPhase: "E50",
    existingStream1: "E77",
    existingStream2: "E78",
    existingStream3: "E79",
    existingStream4: "E80",
    pipelineStream1: "E82",
    pipelineStream2: "E83",
    pipelineStream3: "E84",
    pipelineStream4: "E85",
    potentialStream1: "E87",
    potentialStream2: "E88",
    potentialStream3: "E89",
    potentialStream4: "E90",
    potentialStream1Probability: "E93",
    potentialStream2Probability: "E94",
    potentialStream3Probability: "E95",
    potentialStream4Probability: "E96",
    existingStreamsPrice: "J100 >> Q100",
    existingStreamsVolume: "J114 >> Q114",
    existingStreamsPriceGrowth: "J102 >> Q103",
    existingStreamsContribution: "J148 >> Q148",
    existingStreamsGrossMargin: "L167 >> Q167",
    pipelineStreamsGrossMargin: "L171 >> Q171",
    potentialStreamsGrossMargin: "L175 >> Q175",
    tradeReceivablesDays: "",
    otherReceivablesDays: "",
    inventoryDays: "",
    prepaidExpensesDays: "",
    tradePayablesDays: "",
    salariesPayableDays: "",
    accruedExpensesDays: "",
    taxPayablesDays: "",
    otherPayablesDays: "",
    CashasatValuationDate: "",
    Loans: "",
  },
};

