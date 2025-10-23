import { v4 as uuidv4 } from 'uuid';
import { resolveNotificationConfig } from '@/services/notificationConfigResolver';

export default class ReenvioService {
  constructor() {
    this.protocolos = new Map();
  }

  async reenviarWebhook(data, req) {
    if (!data || !data.product || !data.id) {
      throw new Error('Dados insuficientes para reenviar webhook.');
    }

    const protocolo = uuidv4();

    this.protocolos.set(protocolo, {
      ...data,
      createdAt: new Date(),
      status: 'reenviado',
    });

    return { protocolo };
  }

  async listarProtocolos(filtros = {}) {
    let lista = Array.from(this.protocolos.entries()).map(([uuid, data]) => ({
      uuid,
      ...data,
    }));

    if (filtros.product) {
      lista = lista.filter((p) => p.product === filtros.product);
    }
    if (filtros.id) {
      lista = lista.filter((p) => p.id === filtros.id);
    }

    return lista;
  }

  async consultarProtocolo(uuid) {
    if (!uuid) throw new Error('UUID do protocolo é obrigatório.');

    const protocolo = this.protocolos.get(uuid);
    if (!protocolo) return null;

    return { uuid, ...protocolo };
  }
}