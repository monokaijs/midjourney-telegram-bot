export const ReplicateUtils = {
  run: async function(model: string, inputs: any) {
    let prediction = await this.create(model, inputs)

    while (! [
      'canceled',
      'succeeded',
      'failed'
    ].includes(prediction.status)) {
      await new Promise(_ => setTimeout(_, 250))
      prediction = await this.get(prediction)
    }

    return prediction.output
  },

  async get(prediction: any) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 29000);
    const response = await fetch(`https://replicate.com/api/models${prediction.version.model.absolute_url}/versions/${prediction.version_id}/predictions/${prediction.uuid}`, )
      .then(r => r.json()).then(response => response.prediction);
    clearTimeout(id);
    return response;
  },

  create(model: string, inputs: any) {
    const [path, version] = model.split(':')

    return fetch(`https://replicate.com/api/models/${path}/versions/${version}/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs }),
    }).then(response => response.json())
  }
}
