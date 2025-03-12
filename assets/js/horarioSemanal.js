// horarioSemanal.js

function voltarHome() {
    window.location.href = "index.html";
  }
  
  function baixarImagem() {
    const imgElement = document.getElementById("img-horario-semanal");
    const link = document.createElement("a");
    link.href = imgElement.src;
    link.download = "horario-semanal.png";
    link.click();
  }
  
  function abrirModalImagem() {
    // Obtém o elemento do modal
    const modal = document.getElementById("modalImagem");
    // Obtém a imagem do modal
    const imagemModal = document.getElementById("imagemModal");
    // Obtém a imagem principal
    const imagemHorario = document.getElementById("img-horario-semanal");
  
    // Define a mesma src do img principal
    imagemModal.src = imagemHorario.src;
  
    // Adiciona a classe "aberto" para exibir o modal
    modal.classList.add("aberto");
  }
  
  function fecharModalImagem() {
    const modal = document.getElementById("modalImagem");
    modal.classList.remove("aberto");
  }
  