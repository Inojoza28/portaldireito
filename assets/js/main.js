// main.js

function voltarHome() {
    window.location.href = "index.html";
  }
  
  function abrirHorarioDia() {
    window.location.href = "horario-dia.html";
  }
  
  function abrirHorarioSemanal() {
    window.location.href = "horario-semanal.html";
  }

  function abrirPortalAluno() {
    window.location.href = "portal-aluno.html";
  }
  
  // function redirecionarWhatsApp() {
  //   const whatsappLink = "";
  //   window.open(whatsappLink, "_blank");
  // }
  
  function redirecionarInstagram() {
    const instaLink = "https://www.instagram.com/direitouninassaubv/";
    window.open(instaLink, "_blank");
  }
  
  function abrirMenu() {
    document.getElementById('sideMenu').classList.add('aberto');
    document.getElementById('menuOverlay').classList.add('aberto');
  }
  
  function fecharMenu() {
    document.getElementById('sideMenu').classList.remove('aberto');
    document.getElementById('menuOverlay').classList.remove('aberto');
  }
  
  
  /**
   * Detecta clique no documento:
   * - Se o menu está aberto
   * - E se o clique NÃO foi dentro do #sideMenu
   * - E também NÃO foi no botão de abrir
   * => então fecha o menu
   */
  document.addEventListener('click', (event) => {
    const sideMenu = document.getElementById("sideMenu");
    const menuToggle = document.querySelector('.menu-toggle'); // Botão hambúrguer
    
    if (sideMenu.classList.contains('aberto')) {
      // Se clicou fora do sideMenu E fora do menu-toggle, fecha
      if (!sideMenu.contains(event.target) && !menuToggle.contains(event.target)) {
        fecharMenu();
      }
    }
  });
  