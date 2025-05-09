import axios from 'axios';

interface Versiculo {
  livro: string;
  capitulo: number;
  versiculo: number;
  texto: string;
}

const obterVersiculoApi = async (livro: string, capitulo: number, versiculo: number): Promise<Versiculo | null> => {
  try {
    const response = await axios.get(`https://bibleapi.co/api/v1/bible/verse/${livro}/${capitulo}/${versiculo}`);
    if (response.data) {
      const versiculoData: Versiculo = {
        livro: response.data.book,
        capitulo: response.data.chapter,
        versiculo: response.data.verse,
        texto: response.data.text,
      };
      return versiculoData;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar versículo na API:', error);
    return null;
  }
};

export { obterVersiculoApi };
