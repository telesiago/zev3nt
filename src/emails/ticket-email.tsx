import {
  Html,
  Body,
  Head,
  Heading,
  Container,
  Text,
  Section,
  Hr,
  Img,
} from "@react-email/components";
import * as React from "react";

interface TicketEmailProps {
  attendeeName: string;
  eventTitle: string;
  ticketTierName: string;
  qrCodeToken: string;
  startDate: string;
  locationText: string;
}

export default function TicketEmail({
  attendeeName,
  eventTitle,
  ticketTierName,
  qrCodeToken,
  startDate,
  locationText,
}: TicketEmailProps) {
  // Geramos o URL da imagem do QR Code usando o token seguro
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrCodeToken}`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>O teu bilhete está aqui! 🎉</Heading>

          <Text style={text}>
            Olá, <strong>{attendeeName}</strong>! O teu pagamento foi confirmado
            e o teu lugar no evento está garantido.
          </Text>

          <Section style={ticketBox}>
            <Heading as="h2" style={eventTitleStyle}>
              {eventTitle}
            </Heading>
            <Text style={detailsText}>
              <strong>Lote:</strong> {ticketTierName}
            </Text>
            <Text style={detailsText}>
              <strong>Data:</strong> {startDate}
            </Text>
            <Text style={detailsText}>
              <strong>Local:</strong> {locationText}
            </Text>

            <Hr style={divider} />

            <Text style={instructionText}>
              Apresenta este QR Code na entrada do evento:
            </Text>
            <div style={codeBox}>
              <Img
                src={qrCodeImageUrl}
                alt="QR Code"
                width="200"
                height="200"
                style={{ margin: "0 auto", display: "block" }}
              />
              <Text style={codeText}>
                {qrCodeToken.split("-")[0].toUpperCase()}
              </Text>
            </div>
            <Text style={footerNote}>
              (Guarda este e-mail. Precisarás de apresentar o teu documento de
              identificação com este código na entrada.)
            </Text>
          </Section>

          <Text style={footer}>
            Desejamos-te uma excelente experiência!
            <br />A equipa Zev3nt
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos embutidos (Obrigatório para e-mails)
const main = {
  backgroundColor: "#f6f9fc",
  padding: "40px 0",
  fontFamily: "sans-serif",
};
const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e6ebf1",
  borderRadius: "12px",
  padding: "40px",
  maxWidth: "600px",
  margin: "0 auto",
};
const h1 = {
  color: "#333",
  textAlign: "center" as const,
  margin: "0 0 20px",
  fontSize: "24px",
};
const text = { fontSize: "16px", color: "#555", lineHeight: "1.5" };
const ticketBox = {
  backgroundColor: "#f3f4f6",
  padding: "30px",
  borderRadius: "12px",
  margin: "30px 0",
  textAlign: "center" as const,
};
const eventTitleStyle = {
  margin: "0 0 15px",
  color: "#111",
  fontSize: "22px",
  textTransform: "uppercase" as const,
  fontWeight: "900",
};
const detailsText = { margin: "0 0 8px", color: "#444", fontSize: "15px" };
const divider = { borderColor: "#e5e7eb", margin: "25px 0" };
const instructionText = { margin: "0 0 15px", color: "#555", fontSize: "14px" };
const codeBox = {
  backgroundColor: "#fff",
  padding: "15px 30px",
  borderRadius: "8px",
  display: "inline-block",
  border: "2px dashed #cbd5e1",
};
const codeText = {
  fontFamily: "monospace",
  fontSize: "16px",
  letterSpacing: "2px",
  margin: "15px 0 0",
  fontWeight: "bold",
  color: "#000",
};
const footerNote = { fontSize: "12px", color: "#9ca3af", marginTop: "15px" };
const footer = {
  fontSize: "14px",
  color: "#888",
  textAlign: "center" as const,
  marginTop: "40px",
  lineHeight: "1.6",
};
