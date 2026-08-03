import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, AlertCircle, Loader2, Car, Settings, Battery, Box, Trash2, PlusCircle } from 'lucide-react';
import './App.css';

function App() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    marca: '',
    preco: '',
    quantidade_estoque: '',
    categoria: ''
  });

  const fetchProdutos = () => {
    setLoading(true);
    axios.get('/api/produtos')
      .then(response => {
        setProdutos(response.data);
        setLoading(false);
        setError(null);
      })
      .catch(err => {
        console.error("Erro ao buscar produtos:", err);
        setError('Não foi possível carregar os produtos. Verifique se a API está online.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoProduto(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Parse values to correct types
    const produtoToSubmit = {
      ...novoProduto,
      preco: parseFloat(novoProduto.preco),
      quantidade_estoque: parseInt(novoProduto.quantidade_estoque, 10),
      categoria: novoProduto.categoria || null
    };

    axios.post('/api/produtos', produtoToSubmit)
      .then(response => {
        setProdutos(prev => [...prev, response.data]);
        // Reset form
        setNovoProduto({
          nome: '',
          marca: '',
          preco: '',
          quantidade_estoque: '',
          categoria: ''
        });
        setIsSubmitting(false);
      })
      .catch(err => {
        console.error("Erro ao adicionar produto:", err);
        alert(err.response?.data?.detail || "Erro ao adicionar produto");
        setIsSubmitting(false);
      });
  };

  const handleDeleteProduct = (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;

    axios.delete(`/api/produtos/${id}`)
      .then(() => {
        setProdutos(prev => prev.filter(p => p._id !== id));
      })
      .catch(err => {
        console.error("Erro ao excluir produto:", err);
        alert(err.response?.data?.detail || "Erro ao excluir produto");
      });
  };

  const getCategoryIcon = (categoria) => {
    switch (categoria?.toLowerCase()) {
      case 'elétrica': return <Battery size={20} />;
      case 'filtros': return <Settings size={20} />;
      case 'óleos': return <Box size={20} />;
      default: return <Package size={20} />;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading && produtos.length === 0) {
    return (
      <div className="app-container loading">
        <Loader2 size={48} className="spinner" />
        <p>Carregando catálogo de produtos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container error animate-fade-in glass">
        <AlertCircle size={48} />
        <h2>Ops! Algo deu errado.</h2>
        <p>{error}</p>
        <button onClick={fetchProdutos} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="app-container animate-fade-in">
      <header className="header glass" style={{ padding: '1.5rem' }}>
        <Car size={32} color="#3b82f6" />
        <h1>AutoParts Premium</h1>
      </header>

      {/* Formulário de Cadastro */}
      <section className="form-container glass">
        <h2 className="form-title">
          <PlusCircle size={24} color="#10b981" />
          Cadastrar Novo Produto
        </h2>
        <form className="product-form" onSubmit={handleAddProduct}>
          <div className="form-group">
            <label htmlFor="nome">Nome do Produto</label>
            <input type="text" id="nome" name="nome" required value={novoProduto.nome} onChange={handleInputChange} placeholder="Ex: Vela de Ignição" />
          </div>
          <div className="form-group">
            <label htmlFor="marca">Marca</label>
            <input type="text" id="marca" name="marca" required value={novoProduto.marca} onChange={handleInputChange} placeholder="Ex: NGK" />
          </div>
          <div className="form-group">
            <label htmlFor="preco">Preço (R$)</label>
            <input type="number" step="0.01" id="preco" name="preco" required value={novoProduto.preco} onChange={handleInputChange} placeholder="Ex: 85.50" />
          </div>
          <div className="form-group">
            <label htmlFor="quantidade_estoque">Estoque</label>
            <input type="number" id="quantidade_estoque" name="quantidade_estoque" required value={novoProduto.quantidade_estoque} onChange={handleInputChange} placeholder="Ex: 20" />
          </div>
          <div className="form-group">
            <label htmlFor="categoria">Categoria (Opcional)</label>
            <select id="categoria" name="categoria" value={novoProduto.categoria} onChange={handleInputChange}>
              <option value="">Selecione...</option>
              <option value="Óleos">Óleos</option>
              <option value="Filtros">Filtros</option>
              <option value="Acessórios">Acessórios</option>
              <option value="Elétrica">Elétrica</option>
              <option value="Motor">Motor</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={20} className="spinner" /> : <PlusCircle size={20} />}
              Cadastrar
            </button>
          </div>
        </form>
      </section>

      {/* Lista de Produtos */}
      <main className="grid-container">
        {produtos.map(produto => (
          <div key={produto._id} className="product-card glass">
            <div className="product-header">
              <div className="product-header-top">
                <div>
                  <h2 className="product-title">{produto.nome}</h2>
                  <span className="product-brand">{produto.marca}</span>
                </div>
                <button 
                  className="btn-delete" 
                  onClick={() => handleDeleteProduct(produto._id)}
                  title="Excluir Produto"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            
            {produto.categoria && (
              <div style={{ marginBottom: '0.5rem' }}>
                <span className="product-category" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {getCategoryIcon(produto.categoria)}
                  {produto.categoria}
                </span>
              </div>
            )}
            
            <div className="product-price">
              {formatCurrency(produto.preco)}
            </div>
            
            <div className="product-stock">
              <div className={`stock-indicator ${
                produto.quantidade_estoque > 50 ? 'stock-high' : 
                produto.quantidade_estoque > 10 ? 'stock-low' : 'stock-out'
              }`}></div>
              <span>
                {produto.quantidade_estoque > 0 
                  ? `${produto.quantidade_estoque} unidades em estoque` 
                  : 'Fora de estoque'}
              </span>
            </div>
          </div>
        ))}
        {produtos.length === 0 && !loading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }} className="glass">
            <p>Nenhum produto cadastrado no momento.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
