// import all card svg from asset folder (courtesy to stackoverflow)
const importAll = (r) => {
    let cards = {};
    r.keys().map((item, index) => { cards[item.replace('./', '')] = r(item); });
    return cards;
}

export const cards = importAll(require.context('../assets', false, /\.(gif|jpe?g|svg)$/));
