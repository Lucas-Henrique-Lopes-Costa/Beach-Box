# Beach-Box

### Rodar Aplicação

Para rodar o backend:

cd Backend

```
pip install -r requirements.txt
```

```
python controller.py
```


Em outro teminal rode:

cd Frontend

```
npm install
```

```
npm run dev
```

### Rodar testes

```
npx cypress open
````

### Rodar testes de qualidade

inicializa o sonar(https://docs.sonarsource.com/sonarqube-server/latest/try-out-sonarqube/)

```
/opt/sonarqube/bin/macosx-universal-64/sonar.sh console
```

Acesso é:

Usuário: admin
Senha: Projeto@2025

token: sqp_42d89dd7de102d2a27ec87f082557b94cdf3c34d

/Users/lucashenrique/Projetos/Github/Beach-Box/sonar/bin/sonar-scanner \
  -Dsonar.projectKey=beach-box \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=sqp_42d89dd7de102d2a27ec87f082557b94cdf3c34d