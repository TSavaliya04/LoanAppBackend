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

const NAVY = "#1E1B6B";
const OPTION_BG = ["#EDE9FE", "#EAF0FB", "#E6F4EA"];
const OPTION_TEXT = ["#4B0082", "#1E1B6B", "#14532D"];

const styles = StyleSheet.create({
  page: {
    paddingTop: 15,
    paddingRight: 10,
    paddingLeft: 10,
    fontSize: 5,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F0D2E",
    textAlign: "center",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 10,
  },
  sectionCard: {
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  headerCard: {
    backgroundColor: "#F1F1F8",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0F0D2E",
    backgroundColor: "#F1F1F8",
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEEEF4",
  },
  labelCol: {
    flex: 1.3,
    paddingVertical: 5,
    paddingHorizontal: 10,
    justifyContent: "center",
    borderRightWidth: 0.5,
    borderRightColor: "#EEEEF4",
  },
  valueCol: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 0.5,
    borderRightColor: "#EEEEF4",
  },
  tableCell: {
    fontSize: 10,
    color: "#111827",
  },
  labelCell: {
    fontSize: 10,
    color: "#374151",
  },
  totalRow: {
    backgroundColor: "#EEF0FA",
  },
  totalCell: {
    fontSize: 12,
    fontWeight: "bold",
    color: NAVY,
  },
  grandTotalRow: {
    backgroundColor: "#E6F4EA",
  },
  grandTotalCell: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#14532D",
  },
});

type ComparisonPDFProps = {
  spanish: (boolean)[];
  loanProgram: (string | number)[];
  price: (string | number)[];
  annualInterestRate: (string | number)[];
  loanAmount: (string | number)[];
  upmipRate: (string | number)[];
  upmipAmount: (string | number)[];
  annualMIPRate: (string | number)[];
  finalLoanAmount: (string | number)[];
  mmi: (string | number)[];
  term: (string | number)[];
  principalAndInterest: (string | number)[];
  monthlyPropertyTax: (string | number)[];
  hazardInsurance: (string | number)[];
  mortgageInsurance: (string | number)[];
  associationFee: (string | number)[];
  monthlyTotal: (string | number)[];
  downPayment: (string | number)[];
  downPaymentAmount: (string | number)[];
  clearingCart: (string | number)[];
  propertyTax: (string | number)[];
  earnestMoneyDeposit: (string | number)[];
  sellerCredit: (string | number)[];
  lenderCredit: (string | number)[];
  totalNeededToClear: (string | number)[];
};

type Variant = "normal" | "total" | "grandTotal" | "credit";

const Row = ({
  label,
  values,
  format = (v) => `${v}`,
  variant = "normal",
}: {
  label: string;
  values: (string | number)[];
  format?: (v: string | number) => string;
  variant?: Variant;
}) => {
  const rowStyle =
    variant === "total"
      ? [styles.tableRow, styles.totalRow]
      : variant === "grandTotal"
        ? [styles.tableRow, styles.grandTotalRow]
        : [styles.tableRow];
  const labelStyle =
    variant === "total"
      ? styles.totalCell
      : variant === "grandTotal"
        ? styles.grandTotalCell
        : styles.labelCell;
  const valueStyle =
    variant === "total"
      ? styles.totalCell
      : variant === "grandTotal"
        ? styles.grandTotalCell
        : variant === "credit"
          ? [styles.tableCell, { color: "red" }]
          : styles.tableCell;
  return (
    <View style={rowStyle}>
      <View style={styles.labelCol}>
        <Text style={labelStyle}>{label}</Text>
      </View>
      {values.map((item, index) => (
        <View key={index} style={styles.valueCol}>
          <Text style={valueStyle}>{format(item)}</Text>
        </View>
      ))}
    </View>
  );
};

const money = (v: string | number) => `$${v}`;
const percent = (v: string | number) => `${v}%`;
const creditMoney = (v: string | number) => `- $${v === "" ? 0 : v ?? 0}`;
const hasValue = (arr?: (string | number)[]) =>
  arr?.some((item) => item !== "" && item != null);

export const ComparisonPDF = ({ data }: { data: ComparisonPDFProps }) => {
  const es = data.spanish[0];
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>{es ? "Comparación de préstamos" : "Loan Comparison"}</Text>
        <Text style={styles.subtitle}>{es ? "Informe de comparación de préstamos profesionales" : "Professional Loan Comparison Report"}</Text>

        <View style={[styles.sectionCard, styles.headerCard]}>
          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.labelCol, { paddingVertical: 10 }]}>
              <Text style={[styles.tableCell, { fontWeight: "bold", color: "#0F0D2E" }]}>{es ? "Tipo de préstamo" : "Loan Type"}</Text>
            </View>
            {data.loanProgram.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.valueCol,
                  { paddingVertical: 10, backgroundColor: OPTION_BG[index % 3] },
                ]}
              >
                <Text style={[styles.tableCell, { fontWeight: "bold", color: OPTION_TEXT[index % 3] }]}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{es ? "Detalles del préstamo" : "Loan Details"}</Text>
          <Row label={es ? "Precio" : "Price"} values={data.price} format={money} />
          <Row label={es ? "Tasa de interés anual" : "Annual Interest Rate"} values={data.annualInterestRate} format={percent} />
          <Row label={es ? "Monto base del préstamo" : "Base Loan Amount"} values={data.loanAmount} format={money} />
          <Row label={es ? "Porcentaje de UPMIP" : "UPMIP Percentage"} values={data.upmipRate} format={percent} />
          <Row label={es ? "Monto de UPMIP" : "UPMIP Amount"} values={data.upmipAmount} format={money} />
          <Row label={es ? "Tarifa MIP" : "MIP Rate"} values={data.annualMIPRate} format={percent} />
          <Row label={es ? "Monto final del préstamo" : "Final Loan Amount"} values={data.finalLoanAmount} format={money} />
          <Row label={es ? "Término" : "Term"} values={data.term} format={(v) => `${v} Year`} />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{es ? "Pago mensual" : "Monthly Payment"}</Text>
          <Row label={es ? "Principal e interés" : "Principal & Interest"} values={data.principalAndInterest} format={money} />
          <Row label="MMI" values={data.mmi} format={money} />
          <Row label={es ? "Impuesto sobre la propiedad" : "Property Tax"} values={data.monthlyPropertyTax} format={money} />
          <Row label={es ? "Seguros contra riesgos" : "Haz Insurance"} values={data.hazardInsurance} format={money} />
          <Row label={es ? "Cuotas de la Asociación de Propietarios" : "HOA Dues"} values={data.associationFee} format={money} />
          <Row label={es ? "Total Mensual" : "Monthly Total"} values={data.monthlyTotal} format={money} variant="total" />
        </View>

        <View style={styles.sectionCard} wrap={false}>
          <Text style={styles.sectionTitle}>{es ? "Efectivo para cerrar" : "Cash to Close"}</Text>
          <Row label={es ? "Porcentaje de pago inicial" : "Down Payment Percentage"} values={data.downPayment} format={percent} />
          <Row label={es ? "Monto del pago inicial" : "Down Payment Amount"} values={data.downPaymentAmount} format={money} />
          <Row label={es ? "Costos de cierre" : "Closing Costs"} values={data.clearingCart} format={money} />
          {hasValue(data.earnestMoneyDeposit) ? (
            <Row label={es ? "Depósito de garantía (EMD)" : "Earnest Money Deposit (EMD)"} values={data.earnestMoneyDeposit} format={creditMoney} variant="credit" />
          ) : null}
          {hasValue(data.sellerCredit) ? (
            <Row label={es ? "Crédito del vendedor" : "Seller Credit"} values={data.sellerCredit} format={creditMoney} variant="credit" />
          ) : null}
          {hasValue(data.lenderCredit) ? (
            <Row label={es ? "Crédito del prestamista" : "Lender Credit"} values={data.lenderCredit} format={creditMoney} variant="credit" />
          ) : null}
          <Row label={es ? "Total necesario para liquidar" : "Total Needed to Clear"} values={data.totalNeededToClear} format={money} variant="grandTotal" />
        </View>
      </Page>
    </Document>
  );
};
