// ── SEED (dados iniciais) ───────────────────────────────────────────────────
const bcrypt = require('bcryptjs');
const { sequelize, User, Category, Content, Profile } = require('./models');

async function seed() {
  const catCount = await Category.count();
  if (catCount > 0) return; // já tem dados, não repete

  // Categorias
  const [scifi, drama, acao, comedia] = await Category.bulkCreate([
    { name: 'Sci-Fi' },
    { name: 'Drama' },
    { name: 'Ação' },
    { name: 'Comédia' },
  ]);

  // Conteúdos
  await Content.bulkCreate([
    {
      title: 'Inception',
      description: 'Um ladrão habilidoso que rouba segredos corporativos através da tecnologia de partilha de sonhos recebe a tarefa inversa de plantar uma ideia na mente de um CEO.',
      genre: 'Sci-Fi', releaseYear: 2010, rating: 4.8,
      imageUrl: 'https://images.pexels.com/photos/33545/sunrise-rose-clouds-sky.jpg?auto=compress&cs=tinysrgb&w=600',
      category_id: scifi.id,
    },
    {
      title: 'Joker',
      description: 'Um comediante em dificuldades descobre-se à deriva na sociedade enquanto passa por uma série de más experiências.',
      genre: 'Drama', releaseYear: 2019, rating: 4.5,
      imageUrl: 'https://images.pexels.com/photos/2156886/pexels-photo-2156886.jpeg?auto=compress&cs=tinysrgb&w=600',
      category_id: drama.id,
    },
    {
      title: 'The Matrix',
      description: 'Um programador descobre que a realidade que conhece é uma simulação criada por máquinas.',
      genre: 'Sci-Fi', releaseYear: 1999, rating: 4.7,
      imageUrl: 'https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=600',
      category_id: scifi.id,
    },
    {
      title: 'Interstellar',
      description: 'Uma equipa de exploradores viaja através de um buraco de minhoca no espaço para garantir a sobrevivência da humanidade.',
      genre: 'Sci-Fi', releaseYear: 2014, rating: 4.7,
      imageUrl: 'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&w=600',
      category_id: scifi.id,
    },
    {
      title: 'The Dark Knight',
      description: 'O Batman encontra o Joker, um criminoso que quer mergulhar Gotham City no caos.',
      genre: 'Ação', releaseYear: 2008, rating: 4.9,
      imageUrl: 'https://images.pexels.com/photos/1809644/pexels-photo-1809644.jpeg?auto=compress&cs=tinysrgb&w=600',
      category_id: acao.id,
    },
  ]);

  // Utilizador administrador
  const adminHash = await bcrypt.hash('admin1234', 10);
  await User.create({ email: 'admin@estflix.pt', password: adminHash, name: 'Administrador', role: 'admin' });

  // Utilizador de demonstração
  const hash = await bcrypt.hash('demo1234', 10);
  const user = await User.create({ email: 'demo@estflix.pt', password: hash, name: 'Demo', role: 'user' });
  await Profile.bulkCreate([
    { name: 'João', avatar: '👨‍💼', user_id: user.id },
    { name: 'Ana',  avatar: '👩‍💻', user_id: user.id },
  ]);

  console.log('[seed] Dados iniciais inseridos.');
}

module.exports = seed;
