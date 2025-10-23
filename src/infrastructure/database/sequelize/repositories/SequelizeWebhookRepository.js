export default class SequelizeWebhookRepository {
    constructor({ WebhookModel }) {
        this.webhookModel = WebhookModel;
    }

    async findByIds(product, ids) {
        if (!ids || ids.length === 0) {
            return [];
        }
        const webhooks = await this.webhookModel.findAll({
            where: {
                id: ids,
            },
        });
        return webhooks.map(w => w.get({ plain: true }));
    }

    async update(id, data) {
        return this.webhookModel.update(data, {
            where: { id },
        });
    }
}