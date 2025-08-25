interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>Purple Shopping - Mini App</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="theme-color" content="#8b5cf6" />
      </head>
      <body className="bg-background min-h-screen">
        <div className="container mx-auto max-w-md px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
