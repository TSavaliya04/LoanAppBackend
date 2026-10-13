import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  // Link,
  // PDFViewer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingRight: 100,
    paddingLeft: 100,
    fontSize: 5,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize:16,
    textAlign: "center",
    marginBottom: 30
  },
  disclaimer: {
    fontSize: 5,
    fontStyle: "italic",
    marginBottom: 8,
    lineHeight: 1.3,
    fontWeight: 400,
  },
  row: {
    flexDirection: "row",
    marginBottom: 2,
  },
  label: {
    fontSize: 5,
    marginRight: 4,
  },
  value: {
    fontSize: 5,
    color: "#0070C0",
    textDecoration: "underline",
  },
  underlineField: {
    borderBottomWidth: 1,
    borderColor: "#000",
    minWidth: 150,
    paddingBottom: 2,
    marginRight: 12,
  },
  flexFill: {
    flex: 1,
  },
  rightAlign: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  sectionA: {
    marginTop: 10,
    marginBottom: 8,
  },
  leftColumn: {
    width: "50%",
    paddingRight: 10,
  },
  rightColumn: {
    width: "50%",
    paddingLeft: 10,
  },
  twoColumnRow: {
    flexDirection: "row",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 4,
    minHeight: 14,
  },
  itemLabel: {
    fontSize: 5,
    flex: 1,
  },
  itemValue: {
    fontSize: 5,
    color: "#0070C0",
    textDecoration: "underline",
    minWidth: 80,
    textAlign: "right",
    marginLeft: 10,
  },
  boldValue: {
    fontSize: 5,
    fontWeight: "bold",
    minWidth: 80,
    textAlign: "right",
    marginLeft: 10,
  },
  sectionHeader: {
    fontSize: 5,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
    textAlign: "center",
  },
  tableHeader: {
    flexDirection: "row",
    marginBottom: 5,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  tableHeaderCell: {
    fontSize: 5,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  tableRow: {
    flexDirection: "row",
    marginBottom: 3,
    minHeight: 12,
  },
  tableCell: {
    fontSize: 5,
    flex: 1,
    paddingHorizontal: 2,
  },
  tableCellNumber: {
    fontSize: 5,
    flex: 1,
    paddingHorizontal: 2,
    textAlign: "right",
  },
  smallText: {
    fontSize: 5,
  },
  totalRow: {
    borderTopWidth: 1,
    borderColor: "#000",
    paddingTop: 5,
    marginTop: 10,
  },
  finalTotal: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
  },
});

type FHAGFEPDFProps = {
  borrower: string;
  propertyAddress: string;
  date: string;
  loanType: string;
  salesPrice: string;
  downPayment: string;
  subFinancing: string;
  otherFinanced: string;
  upfrontMIP: string;
  loanAmount: string;
  interestRate: string;
  loanTerm: string;
  monthlyTaxes: string;
  piLoanAmount: string;
  hazardInsurance: string;
  mortgageInsurance: string;
  loanOriginationFees: string;
  discountFee: string;
  appraisalFee: string;
  prepaidInterest: string;
  hazInsReserve: string;
  escrowFee: string;
  titleInsurance: string;
  estClosingCost: string;
  estPrepaidItemReserves: string;
  totalEstSettlementCharges: string;
  totalEstFundToClose: string;
  hoaDues: string;
  totalMonthlyPTI: string;
  lockRequested: boolean;
  lockRate: string;
  lockExpiration: string;
};

export const FHAGFEPDF = ({ data }: { data: FHAGFEPDFProps }) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      {/* Title text */}
      <Text style={styles.title}>Estimate of Closing Cost Worksheet</Text>

      {/* Disclaimer text */}
      <Text style={styles.disclaimer}>
        This worksheet is an initial estimate of the fees you will incur to
        close the mortgage loan. You will be provided with a good faith Estimate
        of Closing Cost and Truth In Lending disclosures, which will provide
        additional information. This is not an approval of your loan, or a
        commitment to make a loan. Rates and loan programs are subject to
        change.
      </Text>

      {/* Borrower + Date + Loan Type Row */}
      <View style={styles.row}>
        <Text style={styles.label}>BORROWER:</Text>
        <View style={[styles.underlineField, styles.flexFill]}>
          <Text style={styles.value}>{data.borrower}</Text>
        </View>

        <View style={styles.rightAlign}>
          <Text style={styles.label}>Date:</Text>
          <View style={styles.underlineField}>
            <Text style={styles.value}>{data.date}</Text>
          </View>
        </View>
      </View>

      {/* Property Address + Loan Type */}
      <View style={styles.row}>
        <Text style={styles.label}>PROPERTY ADDRESS:</Text>
        <View style={[styles.underlineField, styles.flexFill]}>
          <Text style={styles.value}>{data.propertyAddress}</Text>
        </View>

        <View style={styles.rightAlign}>
          <Text style={styles.label}>LOAN TYPE:</Text>
          <View style={styles.underlineField}>
            <Text style={styles.value}>{data.loanType}</Text>
          </View>
        </View>
      </View>

      {/* Two Column Section */}
      <View style={styles.twoColumnRow}>
        {/* Left Column */}
        <View style={styles.leftColumn}>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>
              A. Sales Price / Appraised Value:
            </Text>
            <Text style={styles.itemValue}>{data.salesPrice}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>B. Down Payment:</Text>
            <Text style={styles.itemValue}>{data.downPayment}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>C. Sub Financing:</Text>
            <Text style={styles.itemValue}>{data.subFinancing}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>I. Other Financed Item:</Text>
            <Text style={styles.itemValue}>{data.otherFinanced}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={[styles.itemLabel, styles.smallText]}>
              (Specify: Upfront MIP/Funding Fee {data.upfrontMIP}%)
            </Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>D. Loan Amount:</Text>
            <Text style={styles.boldValue}>{data.loanAmount}</Text>
          </View>
        </View>

        {/* Right Column */}
        <View style={styles.rightColumn}>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>
              E. P & I Based on Loan Amount D:
            </Text>
            <Text style={styles.boldValue}>{data.piLoanAmount}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={[styles.itemLabel, styles.smallText]}>
              Int. Rate: {data.interestRate}% Loan Term: {data.loanTerm}
            </Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>F. Monthly Real Estate Taxes:</Text>
            <Text style={styles.itemValue}>{data.monthlyTaxes}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>
              G. Monthly Hazard Insurance Premium:
            </Text>
            <Text style={styles.itemValue}>{data.hazardInsurance}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>H. Monthly Mortgage Insurance</Text>
            <Text style={styles.itemValue}>{data.mortgageInsurance}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={[styles.itemLabel, styles.smallText]}>
              (% Coverage 0% Rate)
            </Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>I. HOA Dues:</Text>
            <Text style={styles.itemValue}>{data.hoaDues}</Text>
          </View>

          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>
              J. Total Monthly Payment (PITI):
            </Text>
            <Text style={styles.boldValue}>{data.totalMonthlyPTI}</Text>
          </View>
        </View>
      </View>

      {/* Lock Information Row */}
      <View style={styles.row}>
        <Text style={styles.label}>Borrower request loan locked:</Text>
        <Text style={styles.label}>If Yes, the rate:</Text>
        <Text style={styles.value}>{data.lockRate}</Text>
        <View style={styles.rightAlign}>
          <Text style={styles.label}>Expiration Date:</Text>
          <Text style={styles.value}>{data.lockExpiration}</Text>
        </View>
      </View>

      {/* Estimated Closing Cost Table */}
      <Text style={styles.sectionHeader}>Estimated Closing Cost:</Text>

      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>Lender Pd</Text>
        <Text style={styles.tableHeaderCell}>Borrower/Seller Paid</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCell}>Loan Origination Fee at 0%</Text>
        <Text style={styles.tableCellNumber}>0</Text>
        <Text style={styles.tableCellNumber}>{data.loanOriginationFees}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCell}>Loan Discount Fee at:</Text>
        <Text style={[styles.tableCellNumber, styles.value]}>6.000%</Text>
        <Text style={styles.tableCellNumber}>0</Text>
        <Text style={styles.tableCellNumber}>{data.discountFee}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCell}>Appraisal Fee</Text>
        <Text style={styles.tableCellNumber}>0</Text>
        <Text style={styles.tableCellNumber}>{data.appraisalFee}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCell}>Prepaid Int. (10 days @ 106.4/day)</Text>
        <Text style={styles.tableCellNumber}>0</Text>
        <Text style={styles.tableCellNumber}>{data.prepaidInterest}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCell}>Reserves Deposited with Lender:</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCell}>Hazard Ins. Reserves # ___ mo</Text>
        <Text style={styles.tableCellNumber}>0</Text>
        <Text style={styles.tableCellNumber}>{data.hazInsReserve}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCell}>Property Tax Reserves # ___ mo</Text>
        <Text style={styles.tableCellNumber}>0</Text>
        <Text style={styles.tableCellNumber}>0</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCell}>Settlement / Escrow Closing Fee</Text>
        <Text style={styles.tableCellNumber}>0</Text>
        <Text style={styles.tableCellNumber}>{data.escrowFee}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={styles.tableCell}>Title Insurance</Text>
        <Text style={styles.tableCellNumber}>0</Text>
        <Text style={styles.tableCellNumber}>{data.titleInsurance}</Text>
      </View>

      {/* Totals Section */}
      <View style={[styles.totalRow, styles.itemRow]}>
        <Text style={styles.label}>Est. Closing Costs:</Text>
        <Text style={styles.boldValue}>{data.estClosingCost}</Text>
      </View>

      <View style={styles.itemRow}>
        <Text style={styles.label}>Est. Prepaid Items/Reserves:</Text>
        <Text style={styles.boldValue}>{data.estPrepaidItemReserves}</Text>
      </View>

      <View style={styles.itemRow}>
        <Text style={styles.label}>Total Estimated Settlement Charges:</Text>
        <Text style={styles.boldValue}>{data.totalEstSettlementCharges}</Text>
      </View>

      <View style={styles.itemRow}>
        <Text style={styles.label}>Down Payment (&quot;B&quot; Above):</Text>
        <Text style={styles.boldValue}>{data.downPayment}</Text>
      </View>

      <View style={styles.itemRow}>
        <Text style={styles.label}>Seller Credit:</Text>
      </View>

      <View style={styles.itemRow}>
        <Text style={styles.label}>Escrow Deposit/EMD:</Text>
        <Text style={styles.boldValue}>0</Text>
      </View>

      <View style={[styles.totalRow, styles.finalTotal]}>
        <Text>
          Total Estimated Funds Needed to Close: {data.totalEstFundToClose}
        </Text>
      </View>
    </Page>
  </Document>
);
