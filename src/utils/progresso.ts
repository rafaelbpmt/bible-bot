interface ProgressoUsuario {
    livro: string;
    capitulo: number;
    versiculo: number;
  }
  
  // Exemplo de banco de dados fictício para armazenar o progresso dos usuários.
  // Em um sistema real, você pode usar um banco de dados como MongoDB, MySQL ou outros.
  const progressoDatabase: Record<string, ProgressoUsuario> = {};
  
  // Função para obter o progresso do usuário baseado no número de telefone
  export const obterProgressoUsuario = (numero: string): ProgressoUsuario => {
    // Caso não exista progresso registrado, inicializa com o primeiro livro e capítulo.
    if (!progressoDatabase[numero]) {
      progressoDatabase[numero] = {
        livro: 'Gênesis',
        capitulo: 1,
        versiculo: 1,
      };
    }
  
    return progressoDatabase[numero];
  };
  
  // Função para atualizar o progresso do usuário no banco de dados
  export const atualizarProgressoUsuario = (
    numero: string,
    livro: string,
    capitulo: number,
    versiculo: number
  ): void => {
    progressoDatabase[numero] = {
      livro,
      capitulo,
      versiculo,
    };
  };
  