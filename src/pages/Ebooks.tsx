export default function Ebooks() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold mb-8">eBooks da Aviação</h2>
      <div className="grid md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gray-200 h-48 w-full flex items-center justify-center text-gray-400">
              Capa do Livro
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">Fundamentos de Voo {i}</h3>
              <p className="text-sm text-gray-600 mb-4">Essencial para Piloto Privado, cobre com detalhes toda a matéria da ANAC.</p>
              <button className="text-blue-600 font-bold hover:underline">Acessar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
