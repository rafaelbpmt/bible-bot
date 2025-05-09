import { Whatsapp } from 'venom-bot';

// Função para enviar apenas mensagens de texto
export async function enviarMensagem(client: Whatsapp, numero: string, conteudo: string) {
  try {
    await client.sendText(numero, conteudo);
    console.log(`Mensagem enviada para ${numero}: ${conteudo}`);
  } catch (error) {
    console.error(`Erro ao enviar mensagem para ${numero}:`, error);
  }
}
