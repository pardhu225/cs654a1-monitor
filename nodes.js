const nodes = [
    {
        ip: "127.0.0.1",
        port: "5000",
        validation: res => 1 <= res.rand && res.rand <=40 && res.sum === 46,
    },
    {
        ip: "127.0.0.1",
        port: "5001",
        validation: res => 70 <= res.rand && res.rand <=100 && res.sum === 46,
    },
    {
        ip: "172.23.70.165",
        port: "5000",
        validation: res => 70 <= res.rand && res.rand <=100 && res.sum === 46,
    },
];

module.exports = nodes;