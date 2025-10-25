
import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const filesToCheck = [
  'src/application/dtos/ReenviarWebhookInput.js',
  'src/application/dtos/ReenviarWebhookOutput.js',
  'src/application/useCases/ReenviarWebhookUseCase.js',
  'src/application/controllers/ReenviarWebhookController.js',
  'src/app.js',
];

function checkFile(filePath) {
  const absPath = path.join(__dirname, filePath);
  if (!fs.existsSync(absPath)) {
    console.log(`❌ Faltando: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(absPath, 'utf-8');
  console.log(`✅ Encontrado: ${filePath}`);

  if (filePath.includes('ReenviarWebhookInput.js') && !content.includes('Joi')) {
    console.log('⚠️  Input sem validação Joi.');
  }

  if (filePath.includes('ReenviarWebhookOutput.js') && !content.includes('success') && !content.includes('error')) {
    console.log('⚠️  Output parece incompleto (falta métodos success/error).');
  }

  if (filePath.includes('ReenviarWebhookUseCase.js') && !content.includes('execute')) {
    console.log('⚠️  UseCase sem método execute().');
  }

  if (filePath.includes('ReenviarWebhookController.js') && !content.includes('handle')) {
    console.log('⚠️  Controller sem método handle().');
  }

  return true;
}

console.log('\n🔍 Verificando estrutura do endpoint /reenviar...\n');

let allOk = true;
for (const file of filesToCheck) {
  const ok = checkFile(file);
  if (!ok) allOk = false;
}

if (allOk) {
  console.log('\n✅ Tudo certo! Estrutura principal do /reenviar está completa.\n');
  console.log('👉 Agora só testar no Insomnia/Postman pra confirmar os retornos (200, 400, 422).');
} else {
  console.log('\n⚠️  Há arquivos faltando ou incompletos. Revise as mensagens acima.\n');
}