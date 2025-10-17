import ReenviarWebhookInput from '../dtos/ReenviarWebhookInput.js';
import ReenviarWebhookOutput from '../dtos/ReenviarWebhookOutput.js';


export default function makeReenviarWebhookController({ reenviarWebhookUseCase } = {}) {
  if (!reenviarWebhookUseCase) throw new Error('reenviarWebhookUseCase missing');

  return async function reenviarWebhookController(req, res) {
    try {
      const input = ReenviarWebhookInput ? ReenviarWebhookInput.validate(req.body) : req.body;

      const result = await reenviarWebhookUseCase.execute(input);
      return res.status(200).json(ReenviarWebhookOutput.success(result.protocolo));
    } catch (err) {
      console.error('Erro no reenvio de webhook:', err.message);
      const status = err.status || 400;
      const detalhes = err.ids_invalidos || null;
      return res.status(status).json(ReenviarWebhookOutput.error(status, err.message, detalhes));
    }
  };
}