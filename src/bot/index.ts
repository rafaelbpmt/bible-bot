import { create, Whatsapp } from 'venom-bot';
import { iniciarAgendador } from '../scheduler/dailyTask';

export let client: Whatsapp;  // Definindo a variável 'client' para exportar

create({
  session: 'bible-bot',
  logQR: true,
  
})
  .then((createdClient: Whatsapp) => {
    client = createdClient;  // Atribuindo o cliente à variável exportada
    console.log('BibleBot iniciado com sucesso!');

    // Teste de envio de mensagem
    client.sendText('5521981719670@c.us', 'Olá! Teste do BibleBot funcionando.')
      .then(() => {
        console.log('Mensagem de teste enviada com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao enviar a mensagem de teste:', error);
      });

    // Inicia o agendador para enviar passagens bíblicas
    iniciarAgendador(client);
  })
  .catch((error) => {
    console.error('Erro ao iniciar o BibleBot:', error);
  });
