import { useState, useEffect } from 'react';

export const defaultSiteContent = {
  heroTitle: "Prepare-se para a ANAC com o VooSimples",
  heroSubtitle: "Simulados atualizados, aprendizado adaptativo e acompanhamento de progresso completo para garantir sua aprovação.",
  plans: [
    {
      id: "free",
      name: "Grátis",
      price: "0",
      features: "5 simulados por mês\nEstatísticas básicas"
    },
    {
      id: "premium",
      name: "Premium PP/PC",
      price: "49,90",
      features: "Simulados ILIMITADOS\nAprendizado Adaptativo\nExplicações detalhadas\nAcesso aos eBooks base",
      isPopular: true
    },
    {
      id: "vip",
      name: "VIP Completo",
      price: "89,90",
      features: "Tudo do Premium\nDúvidas com Tutores\nGarantia de Aprovação\nSimulador Específico (IFR)"
    }
  ],
  ebooks: [
    {
      id: 1,
      title: "Meteorologia para Pilotos",
      description: "Guia completo com ilustrações sobre as principais condições meteorológicas.",
      tag: "Mais Vendido"
    },
    {
      id: 2,
      title: "Navegação Aérea Simplificada",
      description: "Do básico ao avançado, aprenda a usar o computador de voo com facilidade.",
      tag: "Novo"
    },
    {
      id: 3,
      title: "Regulamentos de Tráfego Aéreo",
      description: "Atualizado com as últimas normas da legislação aeronáutica do DECEA/ANAC.",
      tag: "Atualizado"
    }
  ]
};

export function useSiteContent() {
  const [content, setContent] = useState(defaultSiteContent);

  useEffect(() => {
    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.SITE_CONTENT) {
          try {
            const parsed = JSON.parse(data.SITE_CONTENT);
            setContent({ ...defaultSiteContent, ...parsed });
          } catch(e) {}
        }
      })
      .catch(console.error);
  }, []);

  return content;
}
