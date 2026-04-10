import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface OrganizerSaleEmailProps {
  organizerName: string;
  eventName: string;
  attendeeName: string;
  attendeeEmail: string;
  ticketName: string;
  amountPaid: number;
  orderId: string;
}

export const OrganizerSaleEmail = ({
  organizerName = "Organizador",
  eventName = "Nome do Evento",
  attendeeName = "João Silva",
  attendeeEmail = "joao@exemplo.com",
  ticketName = "Ingresso VIP",
  amountPaid = 0,
  orderId = "123456",
}: OrganizerSaleEmailProps) => {
  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountPaid);

  return (
    <Html>
      <Head />
      <Preview>🎉 Nova venda realizada para o evento {eventName}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Kaching! 💰 Nova Venda</Heading>

          <Text style={text}>
            Olá, <strong>{organizerName}</strong>!
          </Text>
          <Text style={text}>
            Acabas de realizar uma nova venda para o evento{" "}
            <strong>{eventName}</strong>. Aqui estão os detalhes da transação:
          </Text>

          <Section style={detailsContainer}>
            <Text style={detailItem}>
              <strong>Participante:</strong> {attendeeName} ({attendeeEmail})
            </Text>
            <Text style={detailItem}>
              <strong>Ingresso:</strong> {ticketName}
            </Text>
            <Text style={detailItem}>
              <strong>Valor Pago:</strong>{" "}
              <span style={highlight}>{formattedAmount}</span>
            </Text>
            <Text style={detailItem}>
              <strong>ID do Pedido:</strong> {orderId}
            </Text>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            Podes verificar mais detalhes diretamente no teu painel da Zev3nt.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrganizerSaleEmail;

// Estilos Inline (Obrigatório para compatibilidade com clientes de e-mail)
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "8px",
  border: "1px solid #eee",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 20px",
};

const text = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "24px",
};

const detailsContainer = {
  backgroundColor: "#f9fafb",
  padding: "20px",
  borderRadius: "8px",
  marginTop: "20px",
  marginBottom: "20px",
  border: "1px solid #eaeaea",
};

const detailItem = {
  fontSize: "15px",
  color: "#333",
  margin: "8px 0",
};

const highlight = {
  color: "#16a34a", // Cor verde para o dinheiro
  fontWeight: "bold",
  fontSize: "18px",
};

const divider = {
  borderColor: "#e6ebf1",
  margin: "30px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  textAlign: "center" as const,
};
