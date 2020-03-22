// import all card svg from asset folder (courtesy to stackoverflow)
const importAll = (r) => {
    let card_svgs = {};
    r.keys().map((item, index) => { card_svgs[item.replace('./', '')] = r(item); });
    return card_svgs;
}

export const card_svgs = importAll(require.context('../assets', false, /\.(gif|jpe?g|svg)$/));
