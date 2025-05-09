import { Whatsapp } from 'venom-bot';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { enviarMensagem } from '../utils/enviarMensagem';
import { buscarVersiculosSequenciaisParaUsuario, obterPreferenciaQuantidadeVersiculos } from '../services/versiculoService';

// Interface para usuário
interface Usuario {
  numero: string;
  // Pode adicionar mais campos conforme necessário (nome, ativo, etc.)
}

/**
 * Carrega a lista de usuários do arquivo users.json
 * @returns Array de usuários
 */
const carregarUsuarios = (): Usuario[] => {
  try {
    const usersPath = path.join(__dirname, '../../users.json');
    
    if (fs.existsSync(usersPath)) {
      const usuarios = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      return usuarios;
    }
    
    console.warn('Arquivo users.json não encontrado. Retornando lista vazia.');
    return [];
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    return [];
  }
};

/**
 * Busca versículos para um usuário e envia via WhatsApp
 * @param client Cliente Venom-bot
 * @param usuario Objeto do usuário
 */
const enviarVersiculosParaUsuario = async (client: Whatsapp, usuario: Usuario): Promise<void> => {
  try {
    const { numero } = usuario;
    const numeroFormatado = `${numero}@c.us`; // Formato esperado pelo Venom-bot
    
    // Obter a quantidade preferida de versículos para este usuário
    const quantidadeVersiculos = obterPreferenciaQuantidadeVersiculos(numero);
    
    console.log(`Buscando ${quantidadeVersiculos} versículos para ${numero}...`);
    
    // Buscar os versículos com base no progresso do usuário
    const versiculos = await buscarVersiculosSequenciaisParaUsuario(numero, quantidadeVersiculos);
    
    if (versiculos.length === 0) {
      console.error(`Não foi possível obter versículos para ${numero}`);
      return;
    }
    
    // Enviar mensagem de saudação
    const horario = new Date();
    let saudacao = 'Bom dia';
    if (horario.getHours() >= 12 && horario.getHours() < 18) {
      saudacao = 'Boa tarde';
    } else if (horario.getHours() >= 18) {
      saudacao = 'Boa noite';
    }
    
    await enviarMensagem(client, numeroFormatado, `${saudacao}! Aqui estão seus ${versiculos.length} versículos de hoje:`);
    
    // Pequeno intervalo para não sobrecarregar a API do WhatsApp
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Enviar cada versículo em uma mensagem separada
    for (const versiculo of versiculos) {
      await enviarMensagem(client, numeroFormatado, versiculo.textoCompleto);
      // Pequeno intervalo entre mensagens
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Mensagem de encerramento com reflexão
    await enviarMensagem(client, numeroFormatado, "Que a palavra de Deus ilumine seu dia! 🙏");
    
    console.log(`Versículos enviados com sucesso para ${numero}`);
  } catch (error) {
    console.error(`Erro ao enviar versículos para ${usuario.numero}:`, error);
  }
};

/**
 * Inicia o agendador para enviar versículos diariamente
 * @param client Cliente Venom-bot
 */
export const iniciarAgendador = (client: Whatsapp): void => {
  // Você pode ajustar este horário conforme necessário
  // Formato: minuto hora * * * (minuto, hora, dia do mês, mês, dia da semana)
  const horarioEnvio = '20 11 * * *'; // 8:00 da manhã todos os dias
  
  console.log(`Agendador configurado para enviar versículos às ${horarioEnvio}`);
  
  // Agendar a tarefa diária
  cron.schedule(horarioEnvio, async () => {
    try {
      console.log('Iniciando envio de versículos diários...');
      
      // Carregar a lista de usuários
      const usuarios = carregarUsuarios();
      
      if (usuarios.length === 0) {
        console.warn('Nenhum usuário encontrado para enviar versículos.');
        return;
      }
      
      console.log(`Enviando versículos para ${usuarios.length} usuário(s)...`);
      
      // Para cada usuário, enviar os versículos
      for (const usuario of usuarios) {
        await enviarVersiculosParaUsuario(client, usuario);
        // Intervalo entre usuários para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log('Envio de versículos diários concluído com sucesso!');
    } catch (error) {
      console.error('Erro ao executar tarefa diária:', error);
    }
  });
  
  // Função para testar o envio de versículos imediatamente (útil para desenvolvimento)
  // Descomente esta função para testar
  /*
  console.log('Executando teste de envio imediato de versículos...');
  setTimeout(async () => {
    try {
      const usuarios = carregarUsuarios();
      if (usuarios.length > 0) {
        await enviarVersiculosParaUsuario(client, usuarios[0]);
        console.log('Teste de envio concluído!');
      } else {
        console.warn('Nenhum usuário encontrado para teste.');
      }
    } catch (error) {
      console.error('Erro no teste de envio:', error);
    }
  }, 5000); // Espera 5 segundos após iniciar o bot para testar
  */
};

/**
 * Função para enviar versículos para um usuário específico sob demanda
 * Útil para comandos ou para testes
 * @param client Cliente Venom-bot
 * @param numero Número do telefone do usuário
 */
export const enviarVersiculosParaUsuarioSobDemanda = async (
  client: Whatsapp, 
  numero: string
): Promise<void> => {
  const usuario: Usuario = { numero };
  await enviarVersiculosParaUsuario(client, usuario);
};