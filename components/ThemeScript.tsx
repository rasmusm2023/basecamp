export default function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var theme = localStorage.getItem('preferredTheme');
              var root = document.documentElement;
              if (theme === 'light') {
                root.classList.remove('dark');
              } else {
                root.classList.add('dark');
              }
            } catch (e) {}
          })();
        `,
      }}
    />
  );
}

