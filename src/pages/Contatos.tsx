export default function Contatos() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold mb-8 text-center">Fale Conosco</h2>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg p-3" placeholder="Seu nome" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" className="w-full border border-gray-300 rounded-lg p-3" placeholder="seu@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
            <textarea className="w-full border border-gray-300 rounded-lg p-3 h-32" placeholder="Como podemos ajudar?"></textarea>
          </div>
          <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
            Enviar Mensagem
          </button>
        </form>
      </div>
    </div>
  );
}
