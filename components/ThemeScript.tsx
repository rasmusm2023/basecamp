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
              // Force reflow for Firefox
              void root.offsetHeight;
            } catch (e) {
              // Default to dark mode if localStorage fails
              document.documentElement.classList.add('dark');
            }
          })();
        `,
      }}
    />
  );
}

