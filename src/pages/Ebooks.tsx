import { useSiteContent } from '../hooks/useSiteContent';

export default function Ebooks() {
  const content = useSiteContent();
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold mb-8">eBooks da Aviação</h2>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {content.ebooks.map((ebook: any) => (
          <div key={ebook.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow relative">
            {ebook.tag && <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">{ebook.tag}</div>}
            <div className="bg-gray-200 h-48 w-full flex items-center justify-center text-gray-500 font-medium">
              Capa do Livro
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{ebook.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{ebook.description}</p>
              <button className="text-blue-600 font-bold hover:underline">Acessar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
