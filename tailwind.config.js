/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 杂志编辑风格基础色
        paper: '#F6F3ED',
        ink: '#20201E',
        sub: '#77736C',
        line: '#DDD7CD',
        // 少量城市主题强调色（用于结果页少量点缀）
        accent: {
          shanghai: '#B23A2E',
          chengdu: '#C26D3A',
          hangzhou: '#3E7D5B',
          nanjing: '#5B4A6B',
          guangzhou: '#B8863A',
          xiamen: '#2E7DAE',
          beijing: '#8C2F2F',
          kunming: '#4E8C7A',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        serif: ['Georgia', 'Songti SC', 'SimSun', 'serif'],
      },
      letterSpacing: {
        wide2: '0.18em',
        wide3: '0.28em',
      },
    },
  },
  plugins: [],
}
