const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-pxtorem": {
      rootValue: 16,
      propWhiteList: ['*'],
      minPixelValue: 2,
    },
  },
};

export default config;
