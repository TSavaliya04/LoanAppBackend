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
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
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
    width: "100%",
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
  prepaidInterestDays: string;
  CoverageRate: string;
  TotalMonthlyPayment: string;
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

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 2 }}>
        <View style={{ width: "9.09%" }}>
          <Text style={{ fontSize: 5 }}>BORROWER:</Text>
        </View>
        <View
          style={{
            width: "72.72%",
            borderBottom: "1pt solid black",
            marginHorizontal: 4,
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5, textAlign: "center" }}>
            {data.borrower}
          </Text>
        </View>
        <View style={{ width: "9.09%" }}>
          <Text style={{ fontSize: 5, textAlign: "right" }}>Date:</Text>
        </View>
        <View
          style={{
            width: "9.09%",
            borderBottom: "1pt solid black",
            marginHorizontal: 4,
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text
            style={{
              fontSize: 5,
            }}
          >
            {data.date}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 10 }}>
        <View style={{ width: "18.18%" }}>
          <Text style={{ fontSize: 5 }}>PROPERTY ADDRESS:</Text>
        </View>
        <View
          style={{
            width: "54.54%",
            borderBottom: "1pt solid black",
            marginHorizontal: 4,
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5, textAlign: "center" }}>TBD</Text>
        </View>
        <View style={{ width: "18.18%" }}>
          <Text style={{ fontSize: 5, fontWeight: 700, textAlign: "left" }}>
            LOAN TYPE:
          </Text>
        </View>
        <View
          style={{
            width: "9.09%",
            borderBottom: "1pt solid black",
            marginHorizontal: 4,
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text
            style={{
              fontSize: 5,
            }}
          >
            {data.loanType}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 5 }}>
        <View style={{ width: "18.18%" }}>
          <Text style={{ fontSize: 5 }}>A. Sales Price / Appraised Value</Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.salesPrice}</Text>
        </View>
        <View style={{ width: "9.09%" }}></View>
        <View style={{ width: "27.27%" }}>
          <Text style={{ fontSize: 5 }}>E. P & I Based on Loan Amount D:</Text>
        </View>
        <View style={{ width: "9.09%" }}></View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.piLoanAmount}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 5 }}>
        <View style={{ width: "45.45%" }}></View>
        <View style={{ width: "9.09%" }}>
          <Text style={{ fontSize: 5 }}>Int. Rate:</Text>
        </View>
        <View
          style={{
            width: "9.09%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>{data.interestRate}%</Text>
        </View>
        <View style={{ width: "9.09%" }}>
          <Text style={{ fontSize: 5 }}>Loan Term:</Text>
        </View>
        <View
          style={{
            width: "9.09%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>{data.loanTerm}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 5 }}>
        <View style={{ width: "18.18%" }}>
          <Text style={{ fontSize: 5, fontWeight: 700 }}>B. Down Payment:</Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.downPayment}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 5 }}>
        <View style={{ width: "45.45%" }}></View>
        <View style={{ width: "18.18%" }}>
          <Text style={{ fontSize: 5 }}>F. Monthly Real Estate Taxes</Text>
        </View>
        <View style={{ width: "18.18%" }}></View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.monthlyTaxes}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 5 }}>
        <View style={{ width: "18.18%" }}>
          <Text style={{ fontSize: 5 }}>C. Sub Financing:</Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.subFinancing}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 5 }}>
        <View style={{ width: "45.45%" }}></View>
        <View style={{ width: "27.27%" }}>
          <Text style={{ fontSize: 5 }}>
            G. Monthly Hazard Insurance Premium
          </Text>
        </View>
        <View style={{ width: "9.09%" }}></View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.hazardInsurance}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 5 }}>
        <View style={{ width: "18.18%" }}>
          <Text style={{ fontSize: 5 }}>I. Other Financed Item:</Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.otherFinanced}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 5 }}>
        <View
          style={{
            width: "27.27%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 5 }}>
            (Specify: Upfront MIP/Funding Fee{" "}
            <Text style={{ fontWeight: 700, color: "#538ed5" }}>
              {data.upfrontMIP}%
            </Text>
            )
          </Text>
        </View>
        <View style={{ width: "18.18%" }}></View>
        <View style={{ width: "27.27%" }}>
          <Text style={{ fontSize: 5 }}>H. Monthly Mortgage Insurance</Text>
        </View>
        <View style={{ width: "9.09%" }}></View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.mortgageInsurance}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 5 }}>
        <View style={{ width: "45.45%" }}></View>
        <View style={{ width: "9.09%" }}>
          <Text style={{ fontSize: 5 }}>(% Coverage</Text>
        </View>
        <View
          style={{
            width: "9.09%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>{data.CoverageRate}%</Text>
        </View>
        <View style={{ width: "9.09%" }}>
          <Text style={{ fontSize: 5 }}>,Rate)</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 5 }}>
        <View style={{ width: "18.18%" }}>
          <Text style={{ fontSize: 5 }}>D. Loan Amount:</Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.loanAmount}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 5 }}>
        <View style={{ width: "45.45%" }}></View>
        <View style={{ width: "18.18%" }}>
          <Text style={{ fontSize: 5 }}>I. HOA Dues</Text>
        </View>
        <View style={{ width: "18.18%" }}></View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.hoaDues}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 5 }}>
        <View style={{ width: "45.45%" }}></View>
        <View style={{ width: "18.18%" }}>
          <Text style={{ fontSize: 5 }}>J. Total Monthly Payment (PITI)</Text>
        </View>
        <View style={{ width: "18.18%" }}></View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.TotalMonthlyPayment}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 5 }}>
        <View style={{ width: "18.18%" }}>
          <Text style={{ fontSize: 5 }}>Borrower request loan locked:</Text>
        </View>
        <View style={{ width: "9.09%" }}></View>
        <View style={{ width: "18.18%" }}>
          <Text style={{ fontSize: 5 }}>If Yes, the rate:</Text>
        </View>
        <View
          style={{
            width: "9.09%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>{data.lockRate}%</Text>
        </View>
        <View style={{ width: "18.18%" }}></View>
        <View style={{ width: "9.09%" }}>
          <Text style={{ fontSize: 5 }}>Expiration Date:</Text>
        </View>
        <View
          style={{
            width: "9.09%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>{data.lockExpiration}</Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          width: "100%",
          marginTop: 8,
          marginBottom: 8,
        }}
      >
        <View style={{ width: "27.27%" }}>
          <Text
            style={{
              fontSize: 5,
              fontWeight: 700,
              textDecoration: "underline",
            }}
          >
            Estimated Closing Cost:
          </Text>
        </View>
        <View style={{ width: "18.18%", textAlign: "center" }}>
          <Text
            style={{
              fontSize: 5,
              fontWeight: 700,
              textDecoration: "underline",
            }}
          >
            Borrower Fees
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 4 }}>
        <View style={{ width: "27.27%" }}>
          <Text style={{ fontSize: 5 }}>Loan Discount Fee at: </Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.discountFee}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 4 }}>
        <View style={{ width: "27.27%" }}>
          <Text style={{ fontSize: 5 }}>Appraisal Fee</Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.appraisalFee}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 4 }}>
        <View style={{ width: "27.27%" }}>
          <Text style={{ fontSize: 5 }}>
            Prepaid Int. ({data.prepaidInterestDays} days @153.16/day)
          </Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.prepaidInterest}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 4 }}>
        <View style={{ width: "27.27%" }}>
          <Text style={{ fontSize: 5 }}>Haz. Ins. Premium 12 mo @ 150</Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.hazardInsurance}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 4 }}>
        <View style={{ width: "27.27%" }}>
          <Text style={{ fontSize: 5 }}>Reserves Deposited with Lender:</Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>-</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 4 }}>
        <View style={{ width: "27.27%" }}>
          <Text style={{ fontSize: 5 }}>Hazard Ins. Reserves #___mo</Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.hazInsReserve}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 4 }}>
        <View style={{ width: "27.27%" }}>
          <Text style={{ fontSize: 5 }}>Property Tax Reserves # ___mo</Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>-</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 4 }}>
        <View style={{ width: "27.27%" }}>
          <Text style={{ fontSize: 5 }}>Settlement / Escrow Closing Fee</Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.escrowFee}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 4 }}>
        <View style={{ width: "27.27%" }}>
          <Text style={{ fontSize: 5 }}>Title Insurance</Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.titleInsurance}</Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          width: "100%",
          marginTop: 10,
          marginBottom: 10,
          borderBottom: "1pt solid black",
        }}
      ></View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 4 }}>
        <View style={{ width: "18.18%" }}></View>
        <View style={{ width: "36.36%" }}>
          <Text style={{ fontSize: 5, textAlign: "right" }}>
            Total Estimated Settlement Charges:
          </Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.totalEstSettlementCharges}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 4 }}>
        <View style={{ width: "18.18%" }}></View>
        <View style={{ width: "36.36%" }}>
          <Text style={{ fontSize: 5, textAlign: "right" }}>
            Down Payment (&quot;B&quot; Above):
          </Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.downPayment}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", width: "100%", marginBottom: 4 }}>
        <View style={{ width: "18.18%" }}></View>
        <View style={{ width: "36.36%" }}>
          <Text style={{ fontSize: 5, textAlign: "right" }}>
            Total Estimated Funds Needed to Close:
          </Text>
        </View>
        <View
          style={{
            width: "18.18%",
            borderBottom: "1pt solid black",
            paddingHorizontal: 3,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 700,
            color: "#538ed5",
          }}
        >
          <Text style={{ fontSize: 5 }}>$</Text>
          <Text style={{ fontSize: 5 }}>{data.totalEstFundToClose}</Text>
        </View>
      </View>
    </Page>
  </Document>
);
