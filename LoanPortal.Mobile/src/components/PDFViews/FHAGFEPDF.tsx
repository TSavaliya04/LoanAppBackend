import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Svg,
  Image,
  Path,
  Rect,
} from "@react-pdf/renderer";

const NAVY = "#1E1B4B";
const INDIGO = "#4F46E5";

const styles = StyleSheet.create({
  page: {
    paddingTop: 16,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#9CA3AF",
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoTextWrap: { marginLeft: 6 },
  logoName: { flexDirection: "row", fontSize: 18, color: NAVY },
  logoNameAccent: { color: INDIGO, fontWeight: "bold" },
  logoTagline: {
    fontSize: 5.5,
    letterSpacing: 2,
    color: "#4B5563",
    marginTop: 1,
  },
  headerRight: { alignItems: "flex-end", marginTop: 2 },
  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: NAVY,
    letterSpacing: 0.3,
  },
  headerSub: { fontSize: 6.5, color: "#6B7280", marginTop: 3 },
  // ── Borrower + details ──────────────────────────────────────────────────
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  borrowerName: { fontSize: 14, fontWeight: "bold", color: "#111827" },
  borrowerDetail: { fontSize: 8.5, color: "#4B5563", marginTop: 2 },
  detailBox: {
    width: 208,
    backgroundColor: "#F3F4F8",
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  detailGridRow: { flexDirection: "row" },
  detailCell: { flex: 1, paddingVertical: 3 },
  detailCellRight: {
    flex: 1,
    paddingVertical: 3,
    paddingLeft: 8,
    borderLeftWidth: 0.5,
    borderLeftColor: "#D1D5DB",
  },
  detailDivider: { height: 0.5, backgroundColor: "#D9DBE3" },
  detailLabel: { fontSize: 6.5, color: "#6B7280" },
  detailValue: { fontSize: 8.5, fontWeight: "bold", color: "#111827", marginTop: 2 },
  // ── Sections ────────────────────────────────────────────────────────────
  sectionCard: {
    borderRadius: 5,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F1F8",
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E4E4F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },
  sectionTitle: { fontSize: 10.5, fontWeight: "bold", color: NAVY },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2.6,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },
  label: { fontSize: 8.5, color: "#1F2937" },
  value: { fontSize: 8.5, color: "#111827" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 15,
    backgroundColor: "#EEF0FA",
  },
  totalLabel: { fontSize: 10, fontWeight: "bold", color: NAVY },
  totalValue: { fontSize: 10, fontWeight: "bold", color: NAVY },
  grandTotalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E8F5EC",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  grandTotalLeft: { flexDirection: "row", alignItems: "center" },
  grandIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#D3EBDA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },
  grandTotalLabel: { fontSize: 10.5, fontWeight: "bold", color: "#14532D" },
  grandTotalValue: { fontSize: 13, fontWeight: "bold", color: "#14532D", marginRight: 7 },
  // ── Footer ──────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    left: 40,
    right: 40,
    bottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerNote: { fontSize: 6.5, color: "#6B7280", lineHeight: 1.4, width: 330 },
  footerRight: { flexDirection: "row", alignItems: "center" },
  footerBrand: { fontSize: 7, fontWeight: "bold", color: "#374151" },
  footerSep: { width: 0.5, height: 9, backgroundColor: "#D1D5DB", marginHorizontal: 9 },
  footerPage: { fontSize: 7, color: "#6B7280" },
});

const ICON_HOME = "M3 11l9-8 9 8 M5 10v11h5v-6h4v6h5V10";
const ICON_DOC = "M6 3h9l4 4v14H6z M12 10v7 M14 11.5h-3a1.2 1.2 0 0 0 0 2.4h2a1.2 1.2 0 0 1 0 2.4h-3";
const ICON_COINS =
  "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6 M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6";
const ICON_CARD = "M3 6h18v12H3z M3 10h18 M6 14h4";
const ICON_CALC = "M6 3h12v18H6z M9 6h6v3H9z M9 13h1 M12 13h1 M15 13h1 M9 17h1 M12 17h1 M15 17h1";

const SectionIcon = ({ d, stroke = INDIGO, size = 12 }: { d: string; stroke?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d={d} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const Logo = () => <Image src="/icons/icon-192x192.png" style={{ width: 32, height: 32 }} />;

const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.iconCircle}>
      <SectionIcon d={icon} size={10} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const formatHeaderDate = (date: string, spanish: boolean) => {
  const d = new Date(date);
  if (!date || isNaN(d.getTime())) return date;
  return d.toLocaleDateString(spanish ? "es-US" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

type FHAGFEPDFProps = {
  spanish: boolean;
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
  hazInsReserve: string;
  hazInsReserveMonths: string;
  hazInsPremium: string;
  hazInsPremiumMonthly: string;
  mortgageInsurance: string;
  originationFee: string;
  originationFeePercent: string;
  discountFee: string;
  discountFeePercent: string;
  appraisalFee: string;
  prepaidInterest: string;
  escrowFees: string;
  ppdPropTaxes: string;
  ppdPropTaxesMonths: string;
  titleInsurance: string;
  thirdPartyLenderFee: string;
  estClosingCost: string;
  estPrepaidItemReserves: string;
  totalEstSettlementCharges: string;
  earnestMoneyDeposit: string;
  sellerCredit: string;
  lenderCredit: string;
  totalEstFundToClose: string;
  hoaDues: string;
  prepaidInterestDays: string;
  prepaidInterestPerDay: string;
  coverageRate: string;
  totalMonthlyPayment: string;
  lockRequested: boolean;
  lockRate: string;
  lockExpiration: string;
  // Agent / header info
  agentName: string;
  agentNmls: string;
  agentPhone: string;
  agentEmail: string;
  agentProfile: string; // URL or empty string
  agentInitials: string; // e.g. "TS" – used when profile is empty
};

export const FHAGFEPDF = ({ data }: { data: FHAGFEPDFProps }) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Logo />
          <View style={styles.logoTextWrap}>
            <View style={styles.logoName}>
              <Text style={styles.logoNameAccent}>Loans</Text>
              <Text> N Stuff</Text>
            </View>
            <Text style={styles.logoTagline}>QUOTE  •  COMPARE  •  CLOSE</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerTitle}>
            {data.spanish ? "HOJA DE CARGOS INICIALES" : "INITIAL FEES WORKSHEET"}
          </Text>
          <Text style={styles.headerSub}>
            {data.spanish
              ? "Costos estimados según la información actual."
              : "Estimated costs based on current information."}
          </Text>
          <Text style={[styles.headerSub, { marginTop: 1 }]}>
            {formatHeaderDate(data.date, data.spanish)}
          </Text>
        </View>
      </View>

      {/* ── Borrower + details ─────────────────────────────────────── */}
      <View style={styles.infoRow}>
        <View>
          <Text style={styles.borrowerName}>{data.agentName}</Text>
          {data.agentNmls ? <Text style={styles.borrowerDetail}>NMLS: {data.agentNmls}</Text> : null}
          {data.agentEmail ? <Text style={styles.borrowerDetail}>{data.agentEmail}</Text> : null}
          {data.agentPhone ? <Text style={styles.borrowerDetail}>{data.agentPhone}</Text> : null}
        </View>
        <View style={styles.detailBox}>
          <View style={styles.detailGridRow}>
            <View style={styles.detailCell}>
              <Text style={styles.detailLabel}>{data.spanish ? "Tipo de préstamo" : "Loan Type"}</Text>
              <Text style={styles.detailValue}>{data.loanType}</Text>
            </View>
            <View style={styles.detailCellRight}>
              <Text style={styles.detailLabel}>{data.spanish ? "Dirección de la propiedad" : "Property Address"}</Text>
              <Text style={styles.detailValue}>{data.spanish ? "Por determinar" : "TBD"}</Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailGridRow}>
            <View style={styles.detailCell}>
              <Text style={styles.detailLabel}>{data.spanish ? "Plazo del préstamo" : "Loan Term"}</Text>
              <Text style={styles.detailValue}>{data.loanTerm}</Text>
            </View>
            <View style={styles.detailCellRight}>
              <Text style={styles.detailLabel}>{data.spanish ? "Fecha" : "Date"}</Text>
              <Text style={styles.detailValue}>{data.date}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <SectionHeader icon={ICON_HOME} title={data.spanish ? "Descripción general del préstamo" : "Loan Overview"} />
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Valor tasado" : "Appraised Value"}</Text>
          <Text style={styles.value}>${data.salesPrice}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Depósito" : "Down Payment"}</Text>
          <Text style={styles.value}>${data.downPayment}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Monto del préstamo" : "Loan Amount"}</Text>
          <Text style={styles.value}>${data.loanAmount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Tasa de interés" : "Interest Rate"}</Text>
          <Text style={styles.value}>{data.interestRate}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Plazo del préstamo" : "Loan Term"}</Text>
          <Text style={styles.value}>{data.loanTerm}</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <SectionHeader icon={ICON_DOC} title={data.spanish ? "Desglose mensual" : "Monthly Breakdown"} />
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Principal e interés" : "Principal & Interest"}</Text>
          <Text style={styles.value}>${data.piLoanAmount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Impuesto sobre la propiedad" : "Property Tax"}</Text>
          <Text style={styles.value}>${data.monthlyTaxes}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Seguro contra riesgos" : "Hazard Insurance"}</Text>
          <Text style={styles.value}>${data.hazardInsurance}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Seguro hipotecario" : "Mortgage Insurance"}</Text>
          <Text style={styles.value}>${data.mortgageInsurance}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Cuotas de la Asociación de Propietarios" : "HOA Dues"}</Text>
          <Text style={styles.value}>${data.hoaDues}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {data.spanish ? "Pago Total Mensual" : "Total Monthly Payment"}
          </Text>
          <Text style={styles.totalValue}>${data.totalMonthlyPayment}</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <SectionHeader icon={ICON_COINS} title={data.spanish ? "Costos de cierre estimados" : "Estimated Closing Costs"} />
        <View style={styles.row}>
          <Text style={styles.label}>
            {data.spanish ? "Comisión de apertura del préstamo" : "Loan Origination Fee "} ({data.originationFeePercent}%)
          </Text>
          <Text style={styles.value}>${data.originationFee}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>
            {data.spanish ? "Tarifa de descuento" : "Discount Fee "} ({data.discountFeePercent}%)
          </Text>
          <Text style={styles.value}>${data.discountFee}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Honorarios de tasación" : "Appraisal Fee"}</Text>
          <Text style={styles.value}>${data.appraisalFee}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>
            {data.spanish ? "Interés prepagado " : "Prepaid Int. "} ({data.prepaidInterestDays} {data.spanish ? "días " : "days "} @
            {data.prepaidInterestPerDay}/{data.spanish ? "día" : "day"})
          </Text>
          <Text style={styles.value}>${data.prepaidInterest}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Prima del seguro contra riesgos (12 meses)" : "Hazard Insurance Premium (12 mo)"}</Text>
          <Text style={styles.value}>${data.hazInsPremium}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Reservas de seguro contra riesgos" : "Hazard Ins. Reserves"}</Text>
          <Text style={styles.value}>${data.hazInsReserve}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Reservas de impuestos a la propiedad" : "Property Tax Reserves"}</Text>
          <Text style={styles.value}>${data.ppdPropTaxes}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Comisión de liquidación/depósito en garantía" : "Settlement / Escrow Fee"}</Text>
          <Text style={styles.value}>${data.escrowFees}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Tarifa de título" : "Title Fee"}</Text>
          <Text style={styles.value}>${data.titleInsurance}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Comisión del prestamista externo" : "Third Party Lender Fee"}</Text>
          <Text style={styles.value}>${data.thirdPartyLenderFee}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {data.spanish ? "Costos totales de cierre" : "Total Closing Costs"}
          </Text>
          <Text style={styles.totalValue}>${data.totalEstSettlementCharges}</Text>
        </View>
      </View>

      <View style={styles.sectionCard} wrap={false}>
        <SectionHeader icon={ICON_CARD} title={data.spanish ? "Créditos y totales" : "Credits & Totals"} />
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Depósito" : "Down Payment"}</Text>
          <Text style={styles.value}>${data.downPayment}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{data.spanish ? "Costos totales de cierre" : "Total Closing Costs"}</Text>
          <Text style={styles.value}>${data.totalEstSettlementCharges}</Text>
        </View>
        {data.earnestMoneyDeposit && (
          <View style={styles.row}>
            <Text style={styles.label}>{data.spanish ? "Depósito de garantía (EMD)" : "Earnest Money Deposit (EMD)"}</Text>
            <Text style={[styles.value, { color: "red" }]}>
              - ${data.earnestMoneyDeposit}
            </Text>
          </View>
        )}
        {data.sellerCredit && (
          <View style={styles.row}>
            <Text style={styles.label}>{data.spanish ? "Crédito del vendedor" : "Seller Credit"}</Text>
            <Text style={[styles.value, { color: "red" }]}>
              - ${data.sellerCredit}
            </Text>
          </View>
        )}
        {data.lenderCredit && (
          <View style={styles.row}>
            <Text style={styles.label}>{data.spanish ? "Crédito del prestamista" : "Lender Credit"}</Text>
            <Text style={[styles.value, { color: "red" }]}>
              - ${data.lenderCredit}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.grandTotalBox} wrap={false}>
        <View style={styles.grandTotalLeft}>
          <View style={styles.grandIcon}>
            <SectionIcon d={ICON_CALC} stroke="#166534" size={11} />
          </View>
          <Text style={styles.grandTotalLabel}>
            {data.spanish ? "Fondos totales necesarios para cerrar" : "Total Funds Needed to Close"}
          </Text>
        </View>
        <Text style={styles.grandTotalValue}>${data.totalEstFundToClose}</Text>
      </View>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerNote}>
          {data.spanish
            ? "Esto es un estimado basado en la información proporcionada y está sujeto a cambios.\nNo es un compromiso de préstamo. Los términos, tarifas y costos finales pueden variar."
            : "This is an estimate based on the information provided and is subject to change.\nNot a loan commitment. Final terms, fees and costs may vary."}
        </Text>
        <View style={styles.footerRight}>
          <Text style={styles.footerBrand}>Loans N Stuff</Text>
          <View style={styles.footerSep} />
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }) =>
              `${data.spanish ? "Página" : "Page"} ${pageNumber} ${data.spanish ? "de" : "of"} ${totalPages}`
            }
          />
        </View>
      </View>
    </Page>
  </Document>
);
