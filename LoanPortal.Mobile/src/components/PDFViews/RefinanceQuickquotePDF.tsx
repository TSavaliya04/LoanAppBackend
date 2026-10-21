import { Document, Image, Page, Text, View, StyleSheet } from "@react-pdf/renderer";



const styles = StyleSheet.create({
    page: {
        padding: 30,
        paddingBottom: 52,
        fontFamily: "Helvetica",
        backgroundColor: "#FAFAFA",
    },

    // ── Header ──────────────────────────────────────────────────────────────
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        objectFit: "cover",
    },
    headerAvatarFallback: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#4B0082",
        justifyContent: "center",
        alignItems: "center",
    },
    headerAvatarInitials: {
        fontSize: 16,
        fontFamily: "Helvetica-Bold",
        color: "#FFFFFF",
    },
    headerAgentInfo: {
        flexDirection: "column",
        justifyContent: "center",
        marginLeft: 8,
    },
    headerAgentName: {
        fontSize: 12,
        fontFamily: "Helvetica-Bold",
        color: "#111111",
    },
    headerAgentDetail: {
        fontSize: 8,
        color: "#444444",
        marginTop: 2,
    },
    headerRight: {
        alignItems: "flex-end",
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: "Helvetica-Bold",
        letterSpacing: 1,
    },
    headerTitleQuick: {
        color: "#2563EB",
    },
    headerTitleQuote: {
        color: "#4B0082",
    },
    headerDate: {
        fontSize: 9,
        color: "#888888",
        marginTop: 3,
        textAlign: "right",
    },
    headerDivider: {
        height: 2,
        backgroundColor: "#4B0082",
        marginBottom: 12,
    },

    // ── Cards ────────────────────────────────────────────────────────────────
    cardOrange: {
        backgroundColor: "#FFF4E5",
        borderWidth: 1,
        borderColor: "#FFD5A8",
        borderRadius: 8,
        padding: 14,
        marginBottom: 10,
    },
    cardPurple: {
        backgroundColor: "#F3E8FF",
        borderWidth: 1,
        borderColor: "#E9D5FF",
        borderRadius: 8,
        padding: 14,
        marginBottom: 10,
    },
    cardWhite: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#DDDDDD",
        borderRadius: 8,
        padding: 14,
        marginBottom: 10,
    },

    // ── Section titles ───────────────────────────────────────────────────────
    sectionTitleOrange: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: "#E65100",
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    sectionTitlePurple: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: "#4B0082",
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    divider: {
        height: 1,
        backgroundColor: "#DDDDDD",
        marginVertical: 6,
    },
    dividerPurple: {
        height: 1,
        backgroundColor: "#E9D5FF",
        marginVertical: 6,
    },

    // ── Rows ─────────────────────────────────────────────────────────────────
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    label: {
        fontSize: 9,
        color: "#444444",
        flex: 1,
    },
    value: {
        fontSize: 9,
        color: "#111111",
        textAlign: "right",
    },

    // ── Monthly Payment Breakdown header row ─────────────────────────────────
    paymentHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 4,
    },
    paymentHeaderLabel: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: "#4B0082",
        letterSpacing: 0.5,
        flex: 1,
    },
    paymentHeaderColTitle: {
        fontSize: 7,
        fontFamily: "Helvetica-Bold",
        color: "#4B0082",
        textAlign: "right",
        maxWidth: 70,
        letterSpacing: 0.3,
    },

    // ── Total rows ───────────────────────────────────────────────────────────
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: "#E65100",
    },
    totalValue: {
        fontSize: 12,
        fontFamily: "Helvetica-Bold",
        color: "#E65100",
    },

    // ── Two-column layout (Costs + Rate & Term) ───────────────────────────────
    twoCol: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 10,
    },
    colLeft: {
        flex: 1,
        backgroundColor: "#FFF4E5",
        borderWidth: 1,
        borderColor: "#FFD5A8",
        borderRadius: 8,
        padding: 14,
    },
    colRight: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E9D5FF",
        borderRadius: 8,
        padding: 14,
    },

    // ── Important Information ─────────────────────────────────────────────────
    importantCard: {
        backgroundColor: "#FEF3C7",
        borderWidth: 1,
        borderColor: "#FCD34D",
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        flexDirection: "row",
        gap: 8,
    },
    importantIconCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#FCD34D",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 1,
    },
    importantIconText: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: "#92400E",
    },
    importantContent: {
        flex: 1,
    },
    importantTitle: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        color: "#92400E",
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    importantText: {
        fontSize: 8,
        color: "#78350F",
        lineHeight: 1.5,
    },

    // ── Summary strip ─────────────────────────────────────────────────────────
    summaryCard: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E9D5FF",
        borderRadius: 8,
        padding: 14,
        marginBottom: 10,
    },
    summaryTitle: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: "#4B0082",
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    summaryRow: {
        flexDirection: "row",
        gap: 8,
    },
    summaryItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    summaryIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#4B0082",
        justifyContent: "center",
        alignItems: "center",
    },
    summaryIconText: {
        fontSize: 14,
        color: "#FFFFFF",
    },
    summaryItemContent: {
        flex: 1,
    },
    summaryItemLabel: {
        fontSize: 7,
        fontFamily: "Helvetica-Bold",
        color: "#888888",
        letterSpacing: 0.3,
        marginBottom: 2,
    },
    summaryItemValue: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: "#4B0082",
    },
    summaryItemSub: {
        fontSize: 7,
        color: "#888888",
        marginTop: 1,
    },

    // ── Footer ───────────────────────────────────────────────────────────────
    footer: {
        position: "absolute",
        bottom: 16,
        left: 30,
        right: 30,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#4B0082",
        paddingTop: 6,
    },
    footerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    footerInitialCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#4B0082",
        justifyContent: "center",
        alignItems: "center",
    },
    footerInitialText: {
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        color: "#FFFFFF",
    },
    footerAgentName: {
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        color: "#111111",
    },
    footerCenter: {
        fontSize: 8,
        color: "#888888",
    },
    footerRight: {
        fontSize: 8,
        color: "#888888",
    },
});

type QuickQuoteData = {
    spanish: boolean;
    loanProgram: number;
    refiType: number;
    homeValue: string;
    currentLoanBalance: string;
    loanAmount: string;
    currentDrawAmount: string;
    interestRate: number;
    term: number;
    ltv: number;
    principalInterest: string;
    propertyTax: string;
    hazardInsurance: string;
    hoaFee: string;
    monthlyTotal: string;
    currentpropertytax: string;
    mortgageInsurance: string;
    totalMonthlyPayment: string;
    estimatedMonthlySavings: string;
    estimatedClosingCosts: string;
    cashToClose: string;
    cashToCloseIsPositive: boolean;
    totalDebtToBePaidOff: string;
    // Agent / header info
    agentName: string;
    agentNmls: string;
    agentPhone: string;
    agentEmail: string;
    agentProfile: string; // URL or empty string
    agentInitials: string; // e.g. "TS" – used when profile is empty
    borrowerName: string;
};

export const RefinanceQuickQuotePDF = ({ data }: { data: QuickQuoteData }) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* ── Header ───────────────────────────────────────────────── */}
            <View style={styles.header}>
                {/* Left: Avatar + Agent Info */}
                <View style={styles.headerLeft}>
                    {data.agentProfile ? (
                        <Image src={data.agentProfile} style={styles.headerAvatar} />
                    ) : (
                        <View style={styles.headerAvatarFallback}>
                            <Text style={styles.headerAvatarInitials}>{data.agentInitials}</Text>
                        </View>
                    )}
                    <View style={styles.headerAgentInfo}>
                        <Text style={styles.headerAgentName}>{data.agentName}</Text>
                        {data.agentNmls ? (
                            <Text style={styles.headerAgentDetail}>NMLS: {data.agentNmls}</Text>
                        ) : null}
                        {data.agentPhone ? (
                            <Text style={styles.headerAgentDetail}>{data.agentPhone}</Text>
                        ) : null}
                        {data.agentEmail ? (
                            <Text style={styles.headerAgentDetail}>{data.agentEmail}</Text>
                        ) : null}
                    </View>
                </View>
                {/* Right: QUICK QUOTE title + date */}
                <View style={styles.headerRight}>
                    <Text style={styles.headerTitle}>
                        <Text style={styles.headerTitleQuick}>QUICK </Text>
                        <Text style={styles.headerTitleQuote}>QUOTE</Text>
                    </Text>
                    <Text style={styles.headerDate}>
                        Date Prepared: {new Date().getMonth() + 1}/{new Date().getDate()}/{String(new Date().getFullYear()).slice(-2)}
                    </Text>
                </View>
            </View>
            <View style={styles.headerDivider} />

            {/* ── LOAN INFORMATION ─────────────────────────────────────── */}
            <View style={styles.cardOrange}>
                <Text style={styles.sectionTitleOrange}>
                    {data.spanish ? "INFORMACIÓN DEL PRÉSTAMO" : "LOAN INFORMATION"}
                </Text>
                <View style={styles.divider} />

                <View style={styles.row}>
                    <Text style={styles.label}>{data.spanish ? "Tipo de refinanciamiento" : "Refinance Type"}</Text>
                    <Text style={styles.value}>{data.spanish ? "Tasa y plazo" : "Rate & Term"}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>{data.spanish ? "Valor estimado de la vivienda" : "Estimated Home Value"}</Text>
                    <Text style={styles.value}>${data.homeValue}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>{data.spanish ? "Saldo actual del préstamo" : "Current Loan Balance"}</Text>
                    <Text style={styles.value}>${data.currentLoanBalance}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>{data.spanish ? "Nuevo monto del préstamo" : "New Loan Amount"}</Text>
                    <Text style={styles.value}>${data.loanAmount}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>{data.spanish ? "Relación préstamo-valor (LTV)" : "Loan to Value (LTV)"}</Text>
                    <Text style={styles.value}>${data.loanAmount} ({data.ltv}%)</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>{data.spanish ? "Tasa de interés" : "Interest Rate"}</Text>
                    <Text style={styles.value}>{data.interestRate}%</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>{data.spanish ? "Plazo del préstamo" : "Loan Term"}</Text>
                    <Text style={styles.value}>{data.term} {data.spanish ? "Años" : "Years"}</Text>
                </View>
            </View>

            {/* ── MONTHLY PAYMENT BREAKDOWN ─────────────────────────────── */}
            <View style={styles.cardPurple}>
                <View style={styles.paymentHeaderRow}>
                    <Text style={styles.paymentHeaderLabel}>
                        {data.spanish ? "DESGLOSE DE PAGO MENSUAL" : "MONTHLY PAYMENT BREAKDOWN"}
                    </Text>
                    <Text style={styles.paymentHeaderColTitle}>
                        {data.spanish ? "PAGO\nMENSUAL\nESTIMADO" : "ESTIMATED\nMONTHLY\nPAYMENT"}
                    </Text>
                </View>
                <View style={styles.dividerPurple} />

                <View style={styles.row}>
                    <Text style={styles.label}>{data.spanish ? "Principal e interés" : "Principal & Interest"}</Text>
                    <Text style={styles.value}>${data.principalInterest}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>{data.spanish ? "Impuesto sobre la propiedad" : "Property Tax"}</Text>
                    <Text style={styles.value}>${data.propertyTax}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>{data.spanish ? "Seguro contra riesgos" : "Hazard Insurance"}</Text>
                    <Text style={styles.value}>${data.hazardInsurance}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>{data.spanish ? "Seguro hipotecario" : "Mortgage Insurance"}</Text>
                    <Text style={styles.value}>${data.mortgageInsurance}</Text>
                </View>
                {data.hoaFee && (
                    <View style={styles.row}>
                        <Text style={styles.label}>{data.spanish ? "Cuota de HOA" : "HOA Fee"}</Text>
                        <Text style={styles.value}>${data.hoaFee}</Text>
                    </View>
                )}
                <View style={styles.dividerPurple} />
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>
                        {data.spanish ? "TOTAL PAGO MENSUAL" : "TOTAL MONTHLY PAYMENT"}
                    </Text>
                    <Text style={styles.totalValue}>${data.monthlyTotal}</Text>
                </View>
            </View>

            {/* ── COSTS AT A GLANCE + RATE & TERM ──────────────────────── */}
            <View style={styles.twoCol}>
                {/* Left: Costs at a Glance */}
                <View style={styles.colLeft}>
                    <Text style={styles.sectionTitleOrange}>
                        {data.spanish ? "COSTOS DE UN VISTAZO" : "COSTS AT A GLANCE"}
                    </Text>
                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.label}>{data.spanish ? "Liquidación hipotecaria" : "Mortgage Payoff"}</Text>
                        <Text style={styles.value}>${data.currentLoanBalance}</Text>
                    </View>
                    {data.loanProgram === 5 ? (
                        <View style={styles.row}>
                            <Text style={styles.label}>{data.spanish ? "Límite de consumo de corriente" : "Current Draw limit"}</Text>
                            <Text style={styles.value}>${data.currentDrawAmount}</Text>
                        </View>
                    ) : (
                        <View style={styles.row}>
                            <Text style={styles.label}>{data.spanish ? "Nuevo monto del préstamo" : "New Loan Amount"}</Text>
                            <Text style={styles.value}>${data.loanAmount}</Text>
                        </View>
                    )}
                    <View style={styles.row}>
                        <Text style={styles.label}>{data.spanish ? "Costos de cierre estimados" : "Estimated Closing Costs"}</Text>
                        <Text style={styles.value}>${data.estimatedClosingCosts}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>{data.spanish ? "Deuda a liquidar" : "Debt to be Paid Off"}</Text>
                        <Text style={styles.value}>${data.totalDebtToBePaidOff}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.totalRow}>
                        <Text style={[styles.totalLabel, { color: data.cashToCloseIsPositive ? "#16A34A" : "#E65100" }]}>
                            {data.spanish
                                ? "FONDOS NECESARIOS"
                                : data.cashToCloseIsPositive
                                    ? "CASH TO BORROWER"
                                    : "CASH TO CLOSE"}
                        </Text>
                    </View>
                    <Text style={[styles.totalValue, { marginTop: 2, color: data.cashToCloseIsPositive ? "#16A34A" : "#E65100" }]}>
                        ${data.cashToClose}
                    </Text>
                </View>

                {/* Right: Rate & Term */}
                <View style={styles.colRight}>
                    <Text style={styles.sectionTitlePurple}>
                        {data.spanish ? "TASA Y PLAZO" : "RATE & TERM"}
                    </Text>
                    <View style={styles.dividerPurple} />

                    <View style={styles.row}>
                        <Text style={styles.label}>{data.spanish ? "Tasa de interés" : "Interest Rate"}</Text>
                        <Text style={styles.value}>{data.interestRate}%</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>{data.spanish ? "Plazo del préstamo" : "Loan Term"}</Text>
                        <Text style={styles.value}>{data.term} {data.spanish ? "Años" : "Years"}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>{data.spanish ? "Tipo de refinanciamiento" : "Refinance Type"}</Text>
                        <Text style={styles.value}>{data.spanish ? "Tasa y plazo" : "Rate & Term"}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>{data.spanish ? "Relación préstamo-valor" : "Loan to Value"}</Text>
                        <Text style={styles.value}>{data.ltv}%</Text>
                    </View>
                </View>
            </View>

            {/* ── IMPORTANT INFORMATION ─────────────────────────────────── */}
            <View style={styles.importantCard}>
                <View style={styles.importantIconCircle}>
                    <Text style={styles.importantIconText}>i</Text>
                </View>
                <View style={styles.importantContent}>
                    <Text style={styles.importantTitle}>
                        {data.spanish ? "INFORMACIÓN IMPORTANTE" : "IMPORTANT INFORMATION"}
                    </Text>
                    <Text style={styles.importantText}>
                        {data.spanish
                            ? `Esta es una cotización preliminar de refinanciamiento. El saldo actual del préstamo de $${data.currentLoanBalance} será liquidado y reemplazado con un nuevo préstamo de $${data.loanAmount}. Los términos, tasas y costos finales pueden variar según la aprobación de crédito y las pautas del prestamista.`
                            : `This is a preliminary refinance quote. Your existing loan balance of $${data.currentLoanBalance} will be paid off and replaced with a new loan of $${data.loanAmount}. Final terms, rates, and costs may vary based on credit approval and lender guidelines.`}
                    </Text>
                </View>
            </View>

            {/* ── SUMMARY ───────────────────────────────────────────────── */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>
                    {data.spanish ? "RESUMEN" : "SUMMARY"}
                </Text>
                <View style={styles.summaryRow}>
                    {/* Loan Amount */}
                    <View style={styles.summaryItem}>
                        <View style={styles.summaryIconCircle}>
                            <Text style={styles.summaryIconText}>H</Text>
                        </View>
                        <View style={styles.summaryItemContent}>
                            <Text style={styles.summaryItemLabel}>{data.spanish ? "PRÉSTAMO (LTV)" : "LOAN AMOUNT (LTV)"}</Text>
                            <Text style={styles.summaryItemValue}>${data.loanAmount}</Text>
                            <Text style={styles.summaryItemSub}>({data.ltv}%)</Text>
                        </View>
                    </View>
                    {/* Interest Rate */}
                    <View style={styles.summaryItem}>
                        <View style={styles.summaryIconCircle}>
                            <Text style={styles.summaryIconText}>%</Text>
                        </View>
                        <View style={styles.summaryItemContent}>
                            <Text style={styles.summaryItemLabel}>{data.spanish ? "TASA DE INTERÉS" : "INTEREST RATE"}</Text>
                            <Text style={styles.summaryItemValue}>{data.interestRate}%</Text>
                        </View>
                    </View>
                    {/* Loan Term */}
                    <View style={styles.summaryItem}>
                        <View style={styles.summaryIconCircle}>
                            <Text style={styles.summaryIconText}>C</Text>
                        </View>
                        <View style={styles.summaryItemContent}>
                            <Text style={styles.summaryItemLabel}>{data.spanish ? "PLAZO" : "LOAN TERM"}</Text>
                            <Text style={styles.summaryItemValue}>{data.term}</Text>
                            <Text style={styles.summaryItemSub}>{data.spanish ? "Años" : "Years"}</Text>
                        </View>
                    </View>
                    {/* Monthly Payment */}
                    <View style={styles.summaryItem}>
                        <View style={styles.summaryIconCircle}>
                            <Text style={styles.summaryIconText}>$</Text>
                        </View>
                        <View style={styles.summaryItemContent}>
                            <Text style={styles.summaryItemLabel}>{data.spanish ? "PAGO MENSUAL" : "MONTHLY PAYMENT"}</Text>
                            <Text style={styles.summaryItemValue}>${data.monthlyTotal}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* ── Footer ───────────────────────────────────────────────── */}
            <View style={styles.footer} fixed>
                <View style={styles.footerLeft}>
                    <View style={styles.footerInitialCircle}>
                        <Text style={styles.footerInitialText}>{data.agentInitials.charAt(0)}</Text>
                    </View>
                    <Text style={styles.footerAgentName}>{data.agentName}</Text>
                </View>
                <Text style={styles.footerCenter}>
                    {data.spanish ? "¡Gracias por elegirnos!" : "Thank you for choosing us!"}
                </Text>
                <Text style={styles.footerRight}>Page 1 of 1</Text>
            </View>

        </Page>
    </Document>
);