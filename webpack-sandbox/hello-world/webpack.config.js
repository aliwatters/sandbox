module.exports = {
    entry: {
		a: "./entry.js",
		b: "/webpack/hot/dev-server"
	},
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};
