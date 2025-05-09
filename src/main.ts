import { create, Whatsapp } from 'venom-bot';
import { iniciarAgendador } from './scheduler/dailyTask';

create({
  session: 'bible-bot',
  headless: false, // Mostrar o navegador para depuração
  useChrome: true, // Forçar o uso do Chrome
  devtools: false, // Não abrir DevTools
  debug: true, // Ativar debug para mais logs
  logQR: true, // Mostrar QR no console
  browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'], // Argumentos importantes para alguns sistemas
  puppeteerOptions: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  },
  disableWelcome: true, // Desativar mensagem de boas-vindas
})
  .then((client: Whatsapp) => {
    console.log('BibleBot iniciado com sucesso!');
    iniciarAgendador(client);
  })
  .catch((error) => {
    console.error('Erro ao iniciar o BibleBot:', error);
  });


