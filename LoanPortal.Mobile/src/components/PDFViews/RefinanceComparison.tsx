import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  purple: "#4B0082",
  purpleLight: "#EDE9FF",
  purpleBorder: "#C4B5FD",
  purpleMid: "#7C3AED",
  orange: "#E64A19",
  green: "#16A34A",
  blue: "#2563EB",
  white: "#FFFFFF",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray500: "#6B7280",
  gray700: "#374151",
  gray900: "#111827",
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    paddingTop: 14,
    paddingRight: 14,
    paddingLeft: 14,
    paddingBottom: 14,
    fontSize: 7,
    fontFamily: "Helvetica",
    backgroundColor: "#FAFAFA",
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingBottom: 6,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.purple,
    justifyContent: "center",
    alignItems: "center",
  },
  headerAvatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    objectFit: "cover",
  },
  headerAvatarInitials: { fontSize: 13, fontWeight: "bold", color: C.white },
  headerAgentInfo: { marginLeft: 8, flexDirection: "column" },
  headerAgentName: { fontSize: 10, fontWeight: "bold", color: C.gray900 },
  headerAgentDetail: { fontSize: 7, color: C.gray500, marginTop: 1 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: C.purple,
    letterSpacing: 1,
  },
  headerSubtitle: { fontSize: 7.5, color: C.gray500, marginTop: 2 },
  headerRight: { alignItems: "flex-end" },
  headerDate: { fontSize: 7, color: C.gray500 },
  headerDivider: { height: 2, backgroundColor: C.purple, marginBottom: 8 },

  // ── Two-column layout ────────────────────────────────────────────────────────
  bodyRow: { flexDirection: "row", gap: 8 },
  leftCol: { flex: 2.1, flexDirection: "column", gap: 6 },
  rightCol: { flex: 1, flexDirection: "column", gap: 6 },

  // ── Section card (left) ──────────────────────────────────────────────────────
  sectionCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.gray200,
    borderRadius: 6,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.purpleLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: C.purpleBorder,
  },
  sectionIconBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: C.purple,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  sectionIconChar: { fontSize: 9, fontWeight: "bold", color: C.white },
  sectionTitle: { fontSize: 9, fontWeight: "bold", color: C.purple },

  // ── Table inside section card ────────────────────────────────────────────────
  tableContainer: { paddingHorizontal: 6, paddingBottom: 4 },
  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 7.5,
    fontWeight: "bold",
    color: C.blue,
    textAlign: "center",
  },
  tableHeaderLabel: {
    flex: 1.8,
    fontSize: 7.5,
    fontWeight: "bold",
    color: C.gray700,
  },
  tableDataRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: C.gray100,
  },
  tableDataRowHighlight: {
    flexDirection: "row",
    paddingVertical: 3,
    backgroundColor: C.purpleLight,
    borderBottomWidth: 0.5,
    borderBottomColor: C.purpleBorder,
  },
  tableDataRowTotal: {
    flexDirection: "row",
    paddingVertical: 4,
    backgroundColor: C.purple,
    marginTop: 1,
  },
  tableLabelCell: {
    flex: 1.8,
    fontSize: 7,
    color: C.gray700,
    paddingLeft: 2,
  },
  tableLabelCellBold: {
    flex: 1.8,
    fontSize: 7,
    fontWeight: "bold",
    color: C.gray900,
    paddingLeft: 2,
  },
  tableLabelCellTotal: {
    flex: 1.8,
    fontSize: 7.5,
    fontWeight: "bold",
    color: C.white,
    paddingLeft: 6,
  },
  tableValueCell: {
    flex: 1,
    fontSize: 7,
    color: C.gray700,
    textAlign: "center",
  },
  tableValueCellBold: {
    flex: 1,
    fontSize: 7,
    fontWeight: "bold",
    color: C.gray900,
    textAlign: "center",
  },
  tableValueCellTotal: {
    flex: 1,
    fontSize: 7.5,
    fontWeight: "bold",
    color: C.white,
    textAlign: "center",
  },
  tableValueCellGreen: {
    flex: 1,
    fontSize: 7,
    fontWeight: "bold",
    color: C.green,
    textAlign: "center",
  },
  tableValueCellRed: {
    flex: 1,
    fontSize: 7,
    fontWeight: "bold",
    color: C.orange,
    textAlign: "center",
  },

  // ── Right-side cards ─────────────────────────────────────────────────────────
  rightCard: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.gray200,
    borderRadius: 6,
    overflow: "hidden",
  },
  rightCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.purpleLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: C.purpleBorder,
  },
  rightCardIconBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: C.purple,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  rightCardIconChar: { fontSize: 8, fontWeight: "bold", color: C.white },
  rightCardTitle: { fontSize: 8, fontWeight: "bold", color: C.purple },
  rightCardBody: { padding: 8 },

  // Key Summary
  keySummaryItem: { marginBottom: 8 },
  keySummaryLabel: { fontSize: 7, color: C.gray500, marginBottom: 1 },
  keySummaryValue: { fontSize: 16, fontWeight: "bold", color: C.purple },
  keySummaryOption: { fontSize: 7, color: C.gray500, marginTop: 1 },
  keySummaryDivider: { height: 0.5, backgroundColor: C.gray200, marginVertical: 4 },

  // Cash to Close
  ctcCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#FFD580",
  },
  ctcIconBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: C.orange,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  ctcIconChar: { fontSize: 8, fontWeight: "bold", color: C.white },
  ctcTitle: { fontSize: 8, fontWeight: "bold", color: C.orange },
  ctcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  ctcLabel: { fontSize: 7, color: C.gray700 },
  ctcValue: { fontSize: 7, color: C.gray700 },
  ctcValueRed: { fontSize: 7, color: C.orange },
  ctcTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: C.gray200,
    paddingTop: 5,
    marginTop: 3,
    alignItems: "flex-end",
  },
  ctcTotalLabel: { fontSize: 7.5, fontWeight: "bold", color: C.gray900 },
  ctcTotalValue: { fontSize: 14, fontWeight: "bold", color: C.green },
  ctcTotalOption: { fontSize: 7, color: C.gray500 },

  // Loan Details Explanation
  ldeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDE9FF",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: C.purpleBorder,
  },
  ldeIconBox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.purpleMid,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  ldeIconChar: { fontSize: 8, fontWeight: "bold", color: C.white },
  ldeTitle: { fontSize: 8, fontWeight: "bold", color: C.purple },
  ldeBody: { padding: 8 },
  ldeText: { fontSize: 7, color: C.gray700, lineHeight: 1.5, marginBottom: 5 },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: C.gray300,
  },
  footerLeft: { flexDirection: "row", alignItems: "center" },
  footerIconBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: C.purpleLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  footerIconChar: { fontSize: 8, fontWeight: "bold", color: C.purple },
  footerCompany: { fontSize: 7.5, fontWeight: "bold", color: C.purple },
  footerCenter: { fontSize: 7, color: C.gray500 },
  footerRight: { fontSize: 7, color: C.gray500 },
});

type ComparisonPDFProps = {
  spanish: (boolean)[];
  loanProgram: (string | number)[];
  estimatedPropertyValue: (string | number)[];
  interestRate: (string | number)[];
  loanAmount: (string | number)[];
  upmipRate: (string | number)[];
  upmipAmount: (string | number)[];
  annualMIPRate: (string | number)[];
  mmi: (string | number)[];
  term: (string | number)[];
  finalLoanAmount: (string | number)[];
  ltv: (string | number)[];
  closingCosts: (string | number)[];
  propertyTax: (string | number)[];
  cashOutAmount: (string | number)[];
  principalAndInterest: (string | number)[];
  monthlyPropertyTax: (string | number)[];
  hazardInsurance: (string | number)[];
  mortgageInsurance: (string | number)[];
  associationFee: (string | number)[];
  monthlyTotal: (string | number)[];
  currentLoanBalance: (string | number)[];
  totalDebtToBePaidOff: (string | number)[];
  cashToClose: (string | number)[];
  cashToCloseIsPositive: (boolean)[];
  // Optional header/footer fields
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
  agentInitials?: string;
  agentProfile?: string;
  companyName?: string;
  date?: string;
  // Computed Key Summary (dynamic best values across all scenarios)
  keySummary?: {
    bestRateValue: string | number;    // lowest interest rate
    bestRateOption: number;            // 1-based option index
    lowestPaymentValue: string | number; // lowest monthly total
    lowestPaymentOption: number;
    bestCTCValue: string | number;     // best cash-to-close (max value)
    bestCTCOption: number;
    bestCTCIsPositive: boolean;        // true = cash back to borrower
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name?: string) => {
  if (!name) return "SP";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
};

// ─── PDF Component ────────────────────────────────────────────────────────────
export const RefinanceComparisonPDF = ({ data }: { data: ComparisonPDFProps }) => {
  const sp = data.spanish[0] ?? false;
  const colCount = data.loanProgram.length;

  /** Render value cells for a given array */
  const valueCells = (
    arr: (string | number)[],
    prefix: string = "",
    suffix: string = "",
    cellStyle: ReturnType<typeof StyleSheet.create>[string] = styles.tableValueCell
  ) =>
    Array.from({ length: colCount }, (_, i) => (
      <Text key={i} style={cellStyle as any}>
        {prefix}{arr[i] ?? "—"}{suffix}
      </Text>
    ));

  /** CTC value cells — green if positive, red if negative */
  const ctcValueCells = (arr: (string | number)[]) =>
    Array.from({ length: colCount }, (_, i) => (
      <Text
        key={i}
        style={
          data.cashToCloseIsPositive[i]
            ? styles.tableValueCellGreen
            : styles.tableValueCellRed
        }
      >
        ${arr[i] ?? "—"}
      </Text>
    ));

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>

        {/* ─────────────── HEADER ─────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {data.agentProfile ? (
              <Image src={data.agentProfile} style={styles.headerAvatarImg} />
            ) : (
              <View style={styles.headerAvatarFallback}>
                <Text style={styles.headerAvatarInitials}>
                  {data.agentInitials ?? getInitials(data.agentName)}
                </Text>
              </View>
            )}
            <View style={styles.headerAgentInfo}>
              {data.agentName ? (
                <Text style={styles.headerAgentName}>{data.agentName}</Text>
              ) : null}
              {data.agentPhone ? (
                <Text style={styles.headerAgentDetail}>{data.agentPhone}</Text>
              ) : null}
              {data.agentEmail ? (
                <Text style={styles.headerAgentDetail}>{data.agentEmail}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {sp ? "COMPARACIÓN DE PRÉSTAMOS" : "LOAN COMPARISON"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {sp
                ? "Informe de comparación de préstamos profesionales"
                : "Professional Loan Comparison Report"}
            </Text>
          </View>

          <View style={styles.headerRight}>
            {data.date ? (
              <Text style={styles.headerDate}>
                {sp ? "Fecha preparada:" : "Date Prepared:"} {data.date}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.headerDivider} />

        {/* ─────────────── BODY (2-col) ────────────────────────────────── */}
        <View style={styles.bodyRow}>

          {/* ════════ LEFT COLUMN ════════ */}
          <View style={styles.leftCol}>

            {/* ── LOAN STRUCTURE ── */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBox}>
                  <Text style={styles.sectionIconChar}>H</Text>
                </View>
                <Text style={styles.sectionTitle}>
                  {sp ? "ESTRUCTURA DEL PRÉSTAMO" : "LOAN STRUCTURE"}
                </Text>
              </View>

              <View style={styles.tableContainer}>
                {/* Column headers */}
                <View style={styles.tableHeaderRow}>
                  <Text style={styles.tableHeaderLabel}>
                    {sp ? "Tipo de préstamo" : "Loan Type"}
                  </Text>
                  {data.loanProgram.map((prog, i) => (
                    <Text key={i} style={styles.tableHeaderCell}>{prog}</Text>
                  ))}
                </View>

                {/* Estimated Property Value */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Valor estimado de la propiedad" : "Estimated Property Value"}
                  </Text>
                  {valueCells(data.estimatedPropertyValue, "$")}
                </View>

                {/* Loan Amount */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Monto del préstamo" : "Loan Amount"}
                  </Text>
                  {valueCells(data.loanAmount, "$")}
                </View>

                {/* UPMIP Rate */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Porcentaje de UPMIP" : "UPMIP Percentage"}
                  </Text>
                  {valueCells(data.upmipRate, "", "%")}
                </View>

                {/* UPMIP Amount */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Monto de UPMIP" : "UPMIP Amount"}
                  </Text>
                  {valueCells(data.upmipAmount, "$")}
                </View>

                {/* MIP Rate */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Tarifa MIP" : "MIP Rate"}
                  </Text>
                  {valueCells(data.annualMIPRate, "", "%")}
                </View>

                {/* Final Loan Amount — highlighted */}
                <View style={styles.tableDataRowHighlight}>
                  <Text style={styles.tableLabelCellBold}>
                    {sp ? "Monto final del préstamo" : "Final Loan Amount"}
                  </Text>
                  {valueCells(data.finalLoanAmount, "$", "", styles.tableValueCellBold)}
                </View>

                {/* Interest Rate */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Tasa de interés anual" : "Interest Rate"}
                  </Text>
                  {valueCells(data.interestRate, "", "%")}
                </View>

                {/* Loan Term */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Término" : "Loan Term"}
                  </Text>
                  {valueCells(data.term, "", sp ? " Años" : " Year")}
                </View>
              </View>
            </View>

            {/* ── MONTHLY PAYMENT BREAKDOWN ── */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBox}>
                  <Text style={styles.sectionIconChar}>$</Text>
                </View>
                <Text style={styles.sectionTitle}>
                  {sp ? "DESGLOSE DE PAGO MENSUAL" : "MONTHLY PAYMENT BREAKDOWN"}
                </Text>
              </View>

              <View style={styles.tableContainer}>
                {/* Column headers */}
                <View style={styles.tableHeaderRow}>
                  <Text style={styles.tableHeaderLabel}> </Text>
                  {data.loanProgram.map((_, i) => (
                    <Text key={i} style={styles.tableHeaderCell}>
                      {sp ? `Opción ${i + 1}` : `Option ${i + 1}`}
                    </Text>
                  ))}
                </View>

                {/* Principal & Interest */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Principal e interés" : "Principal & Interest"}
                  </Text>
                  {valueCells(data.principalAndInterest, "$")}
                </View>

                {/* MMI / Mortgage Insurance */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Seguro hipotecario (MIP)" : "Mortgage Insurance (MIP)"}
                  </Text>
                  {valueCells(data.mmi, "$")}
                </View>

                {/* Property Tax */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Impuesto sobre la propiedad" : "Property Tax"}
                  </Text>
                  {valueCells(data.monthlyPropertyTax, "$")}
                </View>

                {/* Hazard Insurance */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Seguros contra riesgos" : "Hazard Insurance"}
                  </Text>
                  {valueCells(data.hazardInsurance, "$")}
                </View>

                {/* HOA Dues */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Cuotas de la Asociación de Propietarios" : "HOA Dues"}
                  </Text>
                  {valueCells(data.associationFee, "$")}
                </View>

                {/* Monthly Total */}
                <View style={styles.tableDataRowTotal}>
                  <Text style={styles.tableLabelCellTotal}>
                    {sp ? "TOTAL MENSUAL" : "MONTHLY TOTAL"}
                  </Text>
                  {valueCells(data.monthlyTotal, "$", "", styles.tableValueCellTotal)}
                </View>
              </View>
            </View>

            {/* ── LOAN TOTALS ── */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBox}>
                  <Text style={styles.sectionIconChar}>L</Text>
                </View>
                <Text style={styles.sectionTitle}>
                  {sp ? "TOTALES DEL PRÉSTAMO" : "LOAN TOTALS"}
                </Text>
              </View>

              <View style={styles.tableContainer}>
                {/* Column headers */}
                <View style={styles.tableHeaderRow}>
                  <Text style={styles.tableHeaderLabel}> </Text>
                  {data.loanProgram.map((_, i) => (
                    <Text key={i} style={styles.tableHeaderCell}>
                      {sp ? `Opción ${i + 1}` : `Option ${i + 1}`}
                    </Text>
                  ))}
                </View>

                {/* LTV Percentage */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Porcentaje LTV" : "LTV Percentage"}
                  </Text>
                  {valueCells(data.ltv, "", "%")}
                </View>

                {/* LTV Amount */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Importe del LTV" : "LTV Amount"}
                  </Text>
                  {valueCells(data.loanAmount, "$")}
                </View>

                {/* Closing Costs */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Costos de cierre" : "Closing Costs"}
                  </Text>
                  {valueCells(data.closingCosts, "$")}
                </View>

                {/* Mortgage Payoff */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Liquidación hipotecaria" : "Mortgage Payoff"}
                  </Text>
                  {valueCells(data.currentLoanBalance, "$")}
                </View>

                {/* Estimated Closing Costs */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Costos de cierre estimados" : "Estimated Closing Costs"}
                  </Text>
                  {valueCells(data.closingCosts, "$")}
                </View>

                {/* New Loan Amount */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Nuevo monto del préstamo" : "New Loan Amount"}
                  </Text>
                  {valueCells(data.loanAmount, "$")}
                </View>

                {/* Debt to be paid off */}
                <View style={styles.tableDataRow}>
                  <Text style={styles.tableLabelCell}>
                    {sp ? "Deuda a liquidar" : "Debt to be paid off"}
                  </Text>
                  {valueCells(data.totalDebtToBePaidOff, "$")}
                </View>

                {/* CTC / CTB — total row */}
                <View style={styles.tableDataRowTotal}>
                  <Text style={styles.tableLabelCellTotal}>
                    {sp ? "TOTAL NECESARIO PARA CERRAR" : "TOTAL NEEDED TO CLOSE"}
                  </Text>
                  {ctcValueCells(data.cashToClose)}
                </View>
              </View>
            </View>

          </View>
          {/* ════════ END LEFT COLUMN ════════ */}

          {/* ════════ RIGHT COLUMN ════════ */}
          <View style={styles.rightCol}>

            {/* ── KEY SUMMARY ── */}
            <View style={styles.rightCard}>
              <View style={styles.rightCardHeader}>
                <View style={styles.rightCardIconBox}>
                  <Text style={styles.rightCardIconChar}>K</Text>
                </View>
                <Text style={styles.rightCardTitle}>
                  {sp ? "RESUMEN CLAVE" : "KEY SUMMARY"}
                </Text>
              </View>
              <View style={styles.rightCardBody}>

                {/* Best Rate */}
                <View style={styles.keySummaryItem}>
                  <Text style={styles.keySummaryLabel}>
                    {sp ? "Mejor Tasa" : "Best Rate"}
                  </Text>
                  <Text style={styles.keySummaryValue}>
                    {data.keySummary?.bestRateValue ?? data.interestRate[0] ?? "—"}%
                  </Text>
                  <Text style={styles.keySummaryOption}>
                    {sp ? "Opción" : "Option"} {data.keySummary?.bestRateOption ?? 1}
                  </Text>
                </View>

                <View style={styles.keySummaryDivider} />

                {/* Lowest Payment */}
                <View style={styles.keySummaryItem}>
                  <Text style={styles.keySummaryLabel}>
                    {sp ? "Pago más bajo" : "Lowest Payment"}
                  </Text>
                  <Text style={styles.keySummaryValue}>
                    ${data.keySummary?.lowestPaymentValue ?? data.monthlyTotal[0] ?? "—"}
                  </Text>
                  <Text style={styles.keySummaryOption}>
                    {sp ? "Opción" : "Option"} {data.keySummary?.lowestPaymentOption ?? 1}
                  </Text>
                </View>

                <View style={styles.keySummaryDivider} />

                {/* Best Cash to Close */}
                <View style={[styles.keySummaryItem, { marginBottom: 0 }]}>
                  <Text style={styles.keySummaryLabel}>
                    {data.keySummary?.bestCTCIsPositive
                      ? (sp ? "Mayor efectivo al prestatario" : "Highest Cash to Borrower")
                      : (sp ? "Menor efectivo para cerrar" : "Lowest Cash to Close")}
                  </Text>
                  <Text style={[
                    styles.keySummaryValue,
                    {
                      color: data.keySummary?.bestCTCIsPositive
                        ? C.green
                        : C.purple,
                    },
                  ]}>
                    ${data.keySummary?.bestCTCValue ?? data.cashToClose[0] ?? "—"}
                  </Text>
                  <Text style={styles.keySummaryOption}>
                    {sp ? "Opción" : "Option"} {data.keySummary?.bestCTCOption ?? 1}
                  </Text>
                </View>

              </View>
            </View>

            {/* ── CASH TO CLOSE (ESTIMATED) ── */}
            <View style={styles.rightCard}>
              <View style={styles.ctcCardHeader}>
                <View style={styles.ctcIconBox}>
                  <Text style={styles.ctcIconChar}>$</Text>
                </View>
                <Text style={styles.ctcTitle}>
                  {sp ? "EFECTIVO PARA CERRAR (ESTIMADO)" : "CASH TO CLOSE (ESTIMATED)"}
                </Text>
              </View>
              <View style={styles.rightCardBody}>

                <View style={styles.ctcRow}>
                  <Text style={styles.ctcLabel}>
                    {sp ? "Costos de cierre" : "Closing Costs"}
                  </Text>
                  <Text style={styles.ctcValue}>
                    ${data.closingCosts[0] ?? "—"}
                  </Text>
                </View>

                <View style={styles.ctcRow}>
                  <Text style={styles.ctcLabel}>
                    {sp ? "Crédito del vendedor" : "Seller Credit"}
                  </Text>
                  <Text style={styles.ctcValueRed}>-$0.00</Text>
                </View>

                <View style={styles.ctcRow}>
                  <Text style={styles.ctcLabel}>
                    {sp ? "Crédito del prestamista" : "Lender Credit"}
                  </Text>
                  <Text style={styles.ctcValueRed}>-$0.00</Text>
                </View>

                <View style={styles.ctcTotalRow}>
                  <View>
                    <Text style={styles.ctcTotalLabel}>
                      {sp ? "Efectivo para cerrar" : "Cash to Close"}
                    </Text>
                    <Text style={styles.ctcTotalOption}>
                      {sp ? "Opción 1" : "Option 1"}
                    </Text>
                  </View>
                  <Text style={styles.ctcTotalValue}>
                    ${data.cashToClose[0] ?? "—"}
                  </Text>
                </View>

              </View>
            </View>

            {/* ── LOAN DETAILS EXPLANATION ── */}
            <View style={styles.rightCard}>
              <View style={styles.ldeCardHeader}>
                <View style={styles.ldeIconBox}>
                  <Text style={styles.ldeIconChar}>i</Text>
                </View>
                <Text style={styles.ldeTitle}>
                  {sp ? "EXPLICACIÓN DE DETALLES DEL PRÉSTAMO" : "LOAN DETAILS EXPLANATION"}
                </Text>
              </View>
              <View style={styles.ldeBody}>
                <Text style={styles.ldeText}>
                  {sp
                    ? "La tasa de interés y el monto del préstamo determinan su pago mensual de capital e intereses."
                    : "The interest rate and loan amount determine your monthly principal & interest payment."}
                </Text>
                <Text style={styles.ldeText}>
                  {sp
                    ? "El pago mensual incluye capital, intereses, seguro hipotecario, impuestos, seguro y HOA."
                    : "Monthly payment includes principal, interest, mortgage insurance, taxes, insurance, and HOA."}
                </Text>
                <Text style={styles.ldeText}>
                  {sp
                    ? "El efectivo para cerrar incluye los costos de cierre estimados y cualquier crédito del vendedor o prestamista."
                    : "Cash to close includes estimated closing costs and any credits from the seller or lender."}
                </Text>
              </View>
            </View>

          </View>
          {/* ════════ END RIGHT COLUMN ════════ */}

        </View>

        {/* ─────────────── FOOTER ─────────────────────────────────────── */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <View style={styles.footerIconBox}>
              <Text style={styles.footerIconChar}>H</Text>
            </View>
            <Text style={styles.footerCompany}>
              {data.companyName ?? data.agentName ?? "Loans N Stuff"}
            </Text>
          </View>
          <Text style={styles.footerCenter}>
            {sp ? "¡Gracias por elegirnos!" : "Thank you for choosing us!"}
          </Text>
          <Text style={styles.footerRight}>Page 1 of 1</Text>
        </View>

      </Page>
    </Document>
  );
};
