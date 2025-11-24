from app import create_app

# Criação da aplicação Flask usando a factory pattern
app = create_app()

if __name__ == "__main__":
    # Inicia o servidor em modo desenvolvimento
    # Você pode ativar debug=True se quiser recarregamento automático
    app.run(host="0.0.0.0", port=5000)
