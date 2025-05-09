import { obterVersiculoApi } from '../utils/bibliaApi';
import { obterProgressoUsuario, atualizarProgressoUsuario } from '../utils/progresso';
import fs from 'fs';
import path from 'path';

// Interface para representar um versículo formatado para envio
interface VersiculoFormatado {
  referencia: string;
  texto: string;
  textoCompleto: string; // Referência + texto para envio
}

// Lista de livros da Bíblia em ordem canônica com informações de capítulos e versículos
interface LivroBiblia {
  nome: string;
  capitulos: number[];  // Cada índice representa um capítulo, e o valor é o número de versículos
}

// Carregar a estrutura da Bíblia do arquivo (ou poderia ser hardcoded aqui)
const carregarEstruturaBiblia = (): LivroBiblia[] => {
  try {
    // Esta é uma versão simplificada. Em produção, você teria um arquivo JSON completo
    // com todos os livros e seus respectivos números de capítulos/versículos
    const estruturaBiblia: LivroBiblia[] = [
      {
        nome: 'Gênesis',
        capitulos: [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24]
      },
      {
        nome: 'Êxodo',
        capitulos: [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38]
      },
      // Adicione outros livros conforme necessário
      {
        nome: 'Salmos',
        capitulos: Array(150).fill(20) // Simplificação, cada capítulo com 20 versículos (ajuste com valores reais)
      },
      {
        nome: 'Provérbios',
        capitulos: Array(31).fill(30) // Simplificação
      },
      {
        nome: 'João',
        capitulos: [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25]
      },
      {
        nome: 'Romanos',
        capitulos: [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27]
      },
      {
        nome: 'Filipenses',
        capitulos: [30, 30, 21, 23]
      }
      // Adicione outros livros conforme necessário
    ];
    
    return estruturaBiblia;
  } catch (error) {
    console.error('Erro ao carregar estrutura da Bíblia:', error);
    // Retorna uma estrutura mínima para não quebrar a aplicação
    return [
      {
        nome: 'Gênesis',
        capitulos: [31, 25, 24]
      },
      {
        nome: 'João',
        capitulos: [51, 25, 36]
      }
    ];
  }
};

// Encontrar o próximo versículo após o versículo atual
const encontrarProximoVersiculo = (
  estruturaBiblia: LivroBiblia[],
  livroAtual: string,
  capituloAtual: number,
  versiculoAtual: number
): { livro: string; capitulo: number; versiculo: number } => {
  const livroIndex = estruturaBiblia.findIndex(l => l.nome === livroAtual);
  
  if (livroIndex === -1) {
    // Se o livro não for encontrado, começar do início
    return {
      livro: estruturaBiblia[0].nome,
      capitulo: 1,
      versiculo: 1
    };
  }

  const livro = estruturaBiblia[livroIndex];
  
  // Ajustar para índices baseados em 0
  const capIndex = capituloAtual - 1;
  
  // Se o capítulo não existir, começar do início do próximo livro ou do primeiro livro
  if (capIndex < 0 || capIndex >= livro.capitulos.length) {
    const proximoLivroIndex = (livroIndex + 1) % estruturaBiblia.length;
    return {
      livro: estruturaBiblia[proximoLivroIndex].nome,
      capitulo: 1,
      versiculo: 1
    };
  }

  const versiculosNoCapitulo = livro.capitulos[capIndex];
  
  // Se for o último versículo do capítulo
  if (versiculoAtual >= versiculosNoCapitulo) {
    // Se for o último capítulo do livro
    if (capIndex + 1 >= livro.capitulos.length) {
      const proximoLivroIndex = (livroIndex + 1) % estruturaBiblia.length;
      return {
        livro: estruturaBiblia[proximoLivroIndex].nome,
        capitulo: 1,
        versiculo: 1
      };
    } else {
      // Próximo capítulo, primeiro versículo
      return {
        livro: livroAtual,
        capitulo: capituloAtual + 1,
        versiculo: 1
      };
    }
  } else {
    // Próximo versículo no mesmo capítulo
    return {
      livro: livroAtual,
      capitulo: capituloAtual,
      versiculo: versiculoAtual + 1
    };
  }
};

/**
 * Busca versículos sequenciais para o usuário com base em seu progresso
 * @param numero Número do telefone do usuário
 * @param quantidade Quantidade de versículos a serem retornados (1-5)
 * @returns Array de versículos formatados para envio
 */
export const buscarVersiculosSequenciaisParaUsuario = async (
  numero: string,
  quantidade: number = 1
): Promise<VersiculoFormatado[]> => {
  // Limitar a quantidade entre 1 e 5
  const qtd = Math.min(Math.max(quantidade, 1), 5);
  
  // Obter o progresso atual do usuário
  const progresso = obterProgressoUsuario(numero);
  
  // Carregar a estrutura da Bíblia
  const estruturaBiblia = carregarEstruturaBiblia();
  
  const versiculos: VersiculoFormatado[] = [];
  let proximoVersiculo = { 
    livro: progresso.livro, 
    capitulo: progresso.capitulo, 
    versiculo: progresso.versiculo 
  };
  
  // Buscar a quantidade desejada de versículos
  for (let i = 0; i < qtd; i++) {
    try {
      // Buscar o versículo da API
      const versiculo = await obterVersiculoApi(
        proximoVersiculo.livro,
        proximoVersiculo.capitulo,
        proximoVersiculo.versiculo
      );
      
      if (versiculo) {
        // Formatar o versículo para envio
        const versiculoFormatado: VersiculoFormatado = {
          referencia: `${versiculo.livro} ${versiculo.capitulo}:${versiculo.versiculo}`,
          texto: versiculo.texto,
          textoCompleto: `${versiculo.livro} ${versiculo.capitulo}:${versiculo.versiculo} - ${versiculo.texto}`
        };
        
        versiculos.push(versiculoFormatado);
        
        // Encontrar o próximo versículo para a próxima iteração
        proximoVersiculo = encontrarProximoVersiculo(
          estruturaBiblia,
          proximoVersiculo.livro,
          proximoVersiculo.capitulo,
          proximoVersiculo.versiculo
        );
      } else {
        // Em caso de falha na API, avançar para o próximo versículo
        proximoVersiculo = encontrarProximoVersiculo(
          estruturaBiblia,
          proximoVersiculo.livro,
          proximoVersiculo.capitulo,
          proximoVersiculo.versiculo
        );
        // Tentar obter mais um versículo (compensando o que falhou)
        i--;
      }
    } catch (error) {
      console.error('Erro ao buscar versículo:', error);
      // Em caso de erro, continuar para o próximo
      proximoVersiculo = encontrarProximoVersiculo(
        estruturaBiblia,
        proximoVersiculo.livro,
        proximoVersiculo.capitulo,
        proximoVersiculo.versiculo
      );
    }
  }
  
  // Atualizar o progresso do usuário para o próximo versículo a ser lido
  if (versiculos.length > 0) {
    atualizarProgressoUsuario(
      numero,
      proximoVersiculo.livro,
      proximoVersiculo.capitulo,
      proximoVersiculo.versiculo
    );
  }
  
  return versiculos;
};

/**
 * Obter as preferências do usuário para quantidade de versículos
 * @param numero Número do telefone do usuário
 * @returns Quantidade preferida de versículos (padrão: 1)
 */
export const obterPreferenciaQuantidadeVersiculos = (numero: string): number => {
  try {
    // Caminho para o arquivo de preferências dos usuários
    const preferencesPath = path.join(__dirname, '../../preferences.json');
    
    // Verificar se o arquivo existe
    if (fs.existsSync(preferencesPath)) {
      const preferences = JSON.parse(fs.readFileSync(preferencesPath, 'utf8'));
      
      // Verificar se há preferência para este usuário
      if (preferences[numero] && preferences[numero].quantidadeVersiculos) {
        // Garantir que está entre 1 e 5
        return Math.min(Math.max(preferences[numero].quantidadeVersiculos, 1), 5);
      }
    }
    
    // Valor padrão se não encontrar preferências
    return 1;
  } catch (error) {
    console.error('Erro ao obter preferências do usuário:', error);
    return 1; // Valor padrão em caso de erro
  }
};

/**
 * Atualizar as preferências do usuário para quantidade de versículos
 * @param numero Número do telefone do usuário
 * @param quantidade Nova quantidade preferida (1-5)
 */
export const atualizarPreferenciaQuantidadeVersiculos = (numero: string, quantidade: number): void => {
  try {
    // Limitar entre 1 e 5
    const qtd = Math.min(Math.max(quantidade, 1), 5);
    
    // Caminho para o arquivo de preferências
    const preferencesPath = path.join(__dirname, '../../preferences.json');
    
    // Carregar preferências existentes ou criar objeto vazio
    let preferences: Record<string, any> = {};
    if (fs.existsSync(preferencesPath)) {
      preferences = JSON.parse(fs.readFileSync(preferencesPath, 'utf8'));
    }
    
    // Atualizar preferências para este usuário
    if (!preferences[numero]) {
      preferences[numero] = {};
    }
    
    preferences[numero].quantidadeVersiculos = qtd;
    
    // Salvar no arquivo
    fs.writeFileSync(preferencesPath, JSON.stringify(preferences, null, 2));
    
    console.log(`Preferências atualizadas para o usuário ${numero}: ${qtd} versículos por dia`);
  } catch (error) {
    console.error('Erro ao atualizar preferências do usuário:', error);
  }
};

// Função legada mantida para compatibilidade
export function gerarVersiculo(ordemCanonica: boolean = false): string {
  const versiculosCanonicos = [
    "Gênesis 1:1 - No princípio, Deus criou os céus e a terra.",
    "Salmos 23:1 - O Senhor é o meu pastor, nada me faltará.",
    "João 3:16 - Porque Deus amou o mundo de tal maneira..."
  ];

  const versiculosAleatorios = [
    "Romanos 8:28 - Sabemos que todas as coisas cooperam para o bem...",
    "Provérbios 3:5 - Confie no Senhor de todo o seu coração...",
    "Filipenses 4:13 - Posso todas as coisas naquele que me fortalece..."
  ];

  if (ordemCanonica) {
    return versiculosCanonicos[0];
  } else {
    const aleatorio = Math.floor(Math.random() * versiculosAleatorios.length);
    return versiculosAleatorios[aleatorio];
  }
}