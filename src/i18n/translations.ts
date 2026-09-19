/**
 * Internationalization (i18n) Translations
 * Provides multi-language support for the application
 */

export type Language = 'en' | 'hi' | 'es' | 'fr' | 'de';

export interface Translations {
  common: {
    loading: string;
    error: string;
    success: string;
    warning: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    view: string;
    add: string;
    search: string;
    filter: string;
    export: string;
    refresh: string;
    logout: string;
    login: string;
    home: string;
    dashboard: string;
    settings: string;
    profile: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    email: string;
    password: string;
    forgotPassword: string;
    resetPassword: string;
    signUp: string;
    signIn: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    invalidCredentials: string;
    loginSuccess: string;
  };
  navigation: {
    dashboard: string;
    orders: string;
    tables: string;
    menu: string;
    categories: string;
    customers: string;
    users: string;
    reports: string;
    settings: string;
  };
  orders: {
    title: string;
    subtitle: string;
    createOrder: string;
    orderNumber: string;
    customer: string;
    table: string;
    total: string;
    status: string;
    created: string;
    actions: string;
    statusPending: string;
    statusPreparing: string;
    statusReady: string;
    statusCompleted: string;
    statusCancelled: string;
    typeDineIn: string;
    typeTakeaway: string;
    typeDelivery: string;
  };
  customers: {
    title: string;
    subtitle: string;
    addCustomer: string;
    customerName: string;
    phone: string;
    email: string;
    status: string;
    tier: string;
    totalOrders: string;
    lastOrder: string;
    statusActive: string;
    statusInactive: string;
    tierRegular: string;
    tierVIP: string;
    tierNew: string;
  };
  users: {
    title: string;
    subtitle: string;
    addUser: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    status: string;
    statusActive: string;
    statusInactive: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    totalRevenue: string;
    totalOrders: string;
    customers: string;
    activeMenuItems: string;
    today: string;
    salesOverview: string;
    orderStatus: string;
    popularItems: string;
    recentOrders: string;
    performanceMetrics: string;
    avgOrderValue: string;
    todaysOrders: string;
  };
  validation: {
    required: string;
    email: string;
    phone: string;
    password: string;
    passwordMatch: string;
    minLength: string;
    maxLength: string;
  };
  errors: {
    network: string;
    server: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    validation: string;
    unknown: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      refresh: 'Refresh',
      logout: 'Logout',
      login: 'Login',
      home: 'Home',
      dashboard: 'Dashboard',
      settings: 'Settings',
      profile: 'Profile',
    },
    auth: {
      loginTitle: 'Welcome Back',
      loginSubtitle: 'Sign in to your account',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      signUp: 'Sign Up',
      signIn: 'Sign In',
      emailPlaceholder: 'Enter your email',
      passwordPlaceholder: 'Enter your password',
      invalidCredentials: 'Invalid email or password',
      loginSuccess: 'Login successful',
    },
    navigation: {
      dashboard: 'Dashboard',
      orders: 'Orders',
      tables: 'Tables',
      menu: 'Menu',
      categories: 'Categories',
      customers: 'Customers',
      users: 'Users',
      reports: 'Reports',
      settings: 'Settings',
    },
    orders: {
      title: 'Orders',
      subtitle: 'Manage and track every order in real time',
      createOrder: 'Create Order',
      orderNumber: 'Order #',
      customer: 'Customer',
      table: 'Table',
      total: 'Total',
      status: 'Status',
      created: 'Created',
      actions: 'Actions',
      statusPending: 'Pending',
      statusPreparing: 'Preparing',
      statusReady: 'Ready',
      statusCompleted: 'Completed',
      statusCancelled: 'Cancelled',
      typeDineIn: 'Dine In',
      typeTakeaway: 'Takeaway',
      typeDelivery: 'Delivery',
    },
    customers: {
      title: 'Customers',
      subtitle: 'Manage your restaurant customers',
      addCustomer: 'Add New Customer',
      customerName: 'Customer Name',
      phone: 'Phone',
      email: 'Email',
      status: 'Status',
      tier: 'Customer Tier',
      totalOrders: 'Total Orders',
      lastOrder: 'Last Order',
      statusActive: 'Active',
      statusInactive: 'Inactive',
      tierRegular: 'Regular',
      tierVIP: 'VIP',
      tierNew: 'New',
    },
    users: {
      title: 'Users',
      subtitle: 'Manage your restaurant team',
      addUser: 'Add New User',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      status: 'Status',
      statusActive: 'Active',
      statusInactive: 'Inactive',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Live restaurant sales, orders, customers, and menu performance',
      totalRevenue: 'Total Revenue',
      totalOrders: 'Total Orders',
      customers: 'Customers',
      activeMenuItems: 'Active Menu Items',
      today: 'today',
      salesOverview: 'Sales Overview',
      orderStatus: 'Order Status',
      popularItems: 'Popular Menu Items',
      recentOrders: 'Recent Orders',
      performanceMetrics: 'Performance Metrics',
      avgOrderValue: 'Avg Order Value',
      todaysOrders: "Today's Orders",
    },
    validation: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      phone: 'Please enter a valid phone number',
      password: 'Password must be at least 8 characters',
      passwordMatch: 'Passwords do not match',
      minLength: 'Must be at least {min} characters',
      maxLength: 'Must not exceed {max} characters',
    },
    errors: {
      network: 'Network error. Please check your connection.',
      server: 'Server error. Please try again later.',
      unauthorized: 'Unauthorized. Please log in.',
      forbidden: 'Access denied.',
      notFound: 'Resource not found.',
      validation: 'Validation error. Please check your input.',
      unknown: 'An unknown error occurred.',
    },
  },
  hi: {
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      warning: 'चेतावनी',
      cancel: 'रद्द करें',
      save: 'सहेजें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      view: 'देखें',
      add: 'जोड़ें',
      search: 'खोजें',
      filter: 'फ़िल्टर',
      export: 'निर्यात',
      refresh: 'ताज़ा करें',
      logout: 'लॉग आउट',
      login: 'लॉग इन',
      home: 'होम',
      dashboard: 'डैशबोर्ड',
      settings: 'सेटिंग्स',
      profile: 'प्रोफ़ाइल',
    },
    auth: {
      loginTitle: 'वापसी पर स्वागत है',
      loginSubtitle: 'अपने खाते में साइन इन करें',
      email: 'ईमेल',
      password: 'पासवर्ड',
      forgotPassword: 'पासवर्ड भूल गए?',
      resetPassword: 'पासवर्ड रीसेट करें',
      signUp: 'साइन अप करें',
      signIn: 'साइन इन करें',
      emailPlaceholder: 'अपना ईमेल दर्ज करें',
      passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
      invalidCredentials: 'अमान्य ईमेल या पासवर्ड',
      loginSuccess: 'लॉगिन सफल',
    },
    navigation: {
      dashboard: 'डैशबोर्ड',
      orders: 'ऑर्डर',
      tables: 'टेबल',
      menu: 'मेनू',
      categories: 'श्रेणियां',
      customers: 'ग्राहक',
      users: 'उपयोगकर्ता',
      reports: 'रिपोर्ट',
      settings: 'सेटिंग्स',
    },
    orders: {
      title: 'ऑर्डर',
      subtitle: 'रीयल-टाइम में हर ऑर्डर को प्रबंधित और ट्रैक करें',
      createOrder: 'ऑर्डर बनाएं',
      orderNumber: 'ऑर्डर #',
      customer: 'ग्राहक',
      table: 'टेबल',
      total: 'कुल',
      status: 'स्थिति',
      created: 'बनाया गया',
      actions: 'कार्य',
      statusPending: 'लंबित',
      statusPreparing: 'तैयार हो रहा है',
      statusReady: 'तैयार',
      statusCompleted: 'पूरा हो गया',
      statusCancelled: 'रद्द',
      typeDineIn: 'डाइन-इन',
      typeTakeaway: 'टेकअवे',
      typeDelivery: 'डिलीवरी',
    },
    customers: {
      title: 'ग्राहक',
      subtitle: 'अपने रेस्तरां ग्राहकों का प्रबंधन करें',
      addCustomer: 'नया ग्राहक जोड़ें',
      customerName: 'ग्राहक का नाम',
      phone: 'फोन',
      email: 'ईमेल',
      status: 'स्थिति',
      tier: 'ग्राहक स्तर',
      totalOrders: 'कुल ऑर्डर',
      lastOrder: 'अंतिम ऑर्डर',
      statusActive: 'सक्रिय',
      statusInactive: 'निष्क्रिय',
      tierRegular: 'नियमित',
      tierVIP: 'VIP',
      tierNew: 'नया',
    },
    users: {
      title: 'उपयोगकर्ता',
      subtitle: 'अपने रेस्तरां टीम का प्रबंधन करें',
      addUser: 'नया उपयोगकर्ता जोड़ें',
      firstName: 'पहला नाम',
      lastName: 'अंतिम नाम',
      email: 'ईमेल',
      phone: 'फोन',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      status: 'स्थिति',
      statusActive: 'सक्रिय',
      statusInactive: 'निष्क्रिय',
    },
    dashboard: {
      title: 'डैशबोर्ड',
      subtitle: 'लाइव रेस्तरां बिक्री, ऑर्डर, ग्राहक और मेनू प्रदर्शन',
      totalRevenue: 'कुल राजस्व',
      totalOrders: 'कुल ऑर्डर',
      customers: 'ग्राहक',
      activeMenuItems: 'सक्रिय मेनू आइटम',
      today: 'आज',
      salesOverview: 'बिक्री अवलोकन',
      orderStatus: 'ऑर्डर स्थिति',
      popularItems: 'लोकप्रिय मेनू आइटम',
      recentOrders: 'हाल के ऑर्डर',
      performanceMetrics: 'प्रदर्शन मेट्रिक्स',
      avgOrderValue: 'औसत ऑर्डर मूल्य',
      todaysOrders: 'आज के ऑर्डर',
    },
    validation: {
      required: 'यह फ़ील्ड आवश्यक है',
      email: 'कृपया एक वैध ईमेल पता दर्ज करें',
      phone: 'कृपया एक वैध फोन नंबर दर्ज करें',
      password: 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए',
      passwordMatch: 'पासवर्ड मेल नहीं खाते',
      minLength: 'कम से कम {min} अक्षर होने चाहिए',
      maxLength: '{max} अक्षरों से अधिक नहीं होना चाहिए',
    },
    errors: {
      network: 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।',
      server: 'सर्वर त्रुटि। कृपया बाद में प्रयास करें।',
      unauthorized: 'अनधिकृत। कृपया लॉग इन करें।',
      forbidden: 'पहुंच अस्वीकृत।',
      notFound: 'संसाधन नहीं मिला।',
      validation: 'सत्यापन त्रुटि। कृपया अपना इनपुट जांचें।',
      unknown: 'एक अज्ञात त्रुटि हुई।',
    },
  },
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      view: 'Ver',
      add: 'Agregar',
      search: 'Buscar',
      filter: 'Filtrar',
      export: 'Exportar',
      refresh: 'Actualizar',
      logout: 'Cerrar sesión',
      login: 'Iniciar sesión',
      home: 'Inicio',
      dashboard: 'Panel',
      settings: 'Configuración',
      profile: 'Perfil',
    },
    auth: {
      loginTitle: 'Bienvenido de nuevo',
      loginSubtitle: 'Inicia sesión en tu cuenta',
      email: 'Correo electrónico',
      password: 'Contraseña',
      forgotPassword: '¿Olvidaste tu contraseña?',
      resetPassword: 'Restablecer contraseña',
      signUp: 'Registrarse',
      signIn: 'Iniciar sesión',
      emailPlaceholder: 'Ingresa tu correo electrónico',
      passwordPlaceholder: 'Ingresa tu contraseña',
      invalidCredentials: 'Credenciales inválidas',
      loginSuccess: 'Inicio de sesión exitoso',
    },
    navigation: {
      dashboard: 'Panel',
      orders: 'Pedidos',
      tables: 'Mesas',
      menu: 'Menú',
      categories: 'Categorías',
      customers: 'Clientes',
      users: 'Usuarios',
      reports: 'Reportes',
      settings: 'Configuración',
    },
    orders: {
      title: 'Pedidos',
      subtitle: 'Gestiona y rastrea cada pedido en tiempo real',
      createOrder: 'Crear pedido',
      orderNumber: 'Pedido #',
      customer: 'Cliente',
      table: 'Mesa',
      total: 'Total',
      status: 'Estado',
      created: 'Creado',
      actions: 'Acciones',
      statusPending: 'Pendiente',
      statusPreparing: 'Preparando',
      statusReady: 'Listo',
      statusCompleted: 'Completado',
      statusCancelled: 'Cancelado',
      typeDineIn: 'Comer aquí',
      typeTakeaway: 'Para llevar',
      typeDelivery: 'Entrega',
    },
    customers: {
      title: 'Clientes',
      subtitle: 'Gestiona los clientes de tu restaurante',
      addCustomer: 'Agregar nuevo cliente',
      customerName: 'Nombre del cliente',
      phone: 'Teléfono',
      email: 'Correo electrónico',
      status: 'Estado',
      tier: 'Nivel de cliente',
      totalOrders: 'Pedidos totales',
      lastOrder: 'Último pedido',
      statusActive: 'Activo',
      statusInactive: 'Inactivo',
      tierRegular: 'Regular',
      tierVIP: 'VIP',
      tierNew: 'Nuevo',
    },
    users: {
      title: 'Usuarios',
      subtitle: 'Gestiona el equipo de tu restaurante',
      addUser: 'Agregar nuevo usuario',
      firstName: 'Nombre',
      lastName: 'Apellido',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      status: 'Estado',
      statusActive: 'Activo',
      statusInactive: 'Inactivo',
    },
    dashboard: {
      title: 'Panel',
      subtitle: 'Ventas en vivo, pedidos, clientes y rendimiento del menú',
      totalRevenue: 'Ingresos totales',
      totalOrders: 'Pedidos totales',
      customers: 'Clientes',
      activeMenuItems: 'Artículos de menú activos',
      today: 'hoy',
      salesOverview: 'Resumen de ventas',
      orderStatus: 'Estado de pedidos',
      popularItems: 'Artículos populares',
      recentOrders: 'Pedidos recientes',
      performanceMetrics: 'Métricas de rendimiento',
      avgOrderValue: 'Valor promedio del pedido',
      todaysOrders: 'Pedidos de hoy',
    },
    validation: {
      required: 'Este campo es obligatorio',
      email: 'Por favor ingresa un correo electrónico válido',
      phone: 'Por favor ingresa un número de teléfono válido',
      password: 'La contraseña debe tener al menos 8 caracteres',
      passwordMatch: 'Las contraseñas no coinciden',
      minLength: 'Debe tener al menos {min} caracteres',
      maxLength: 'No debe exceder {max} caracteres',
    },
    errors: {
      network: 'Error de red. Por favor verifica tu conexión.',
      server: 'Error del servidor. Por favor intenta más tarde.',
      unauthorized: 'No autorizado. Por favor inicia sesión.',
      forbidden: 'Acceso denegado.',
      notFound: 'Recurso no encontrado.',
      validation: 'Error de validación. Por favor verifica tu entrada.',
      unknown: 'Ocurrió un error desconocido.',
    },
  },
  fr: {
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      warning: 'Avertissement',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      view: 'Voir',
      add: 'Ajouter',
      search: 'Rechercher',
      filter: 'Filtrer',
      export: 'Exporter',
      refresh: 'Actualiser',
      logout: 'Déconnexion',
      login: 'Connexion',
      home: 'Accueil',
      dashboard: 'Tableau de bord',
      settings: 'Paramètres',
      profile: 'Profil',
    },
    auth: {
      loginTitle: 'Bon retour',
      loginSubtitle: 'Connectez-vous à votre compte',
      email: 'Email',
      password: 'Mot de passe',
      forgotPassword: 'Mot de passe oublié?',
      resetPassword: 'Réinitialiser le mot de passe',
      signUp: "S'inscrire",
      signIn: 'Se connecter',
      emailPlaceholder: 'Entrez votre email',
      passwordPlaceholder: 'Entrez votre mot de passe',
      invalidCredentials: 'Identifiants invalides',
      loginSuccess: 'Connexion réussie',
    },
    navigation: {
      dashboard: 'Tableau de bord',
      orders: 'Commandes',
      tables: 'Tables',
      menu: 'Menu',
      categories: 'Catégories',
      customers: 'Clients',
      users: 'Utilisateurs',
      reports: 'Rapports',
      settings: 'Paramètres',
    },
    orders: {
      title: 'Commandes',
      subtitle: 'Gérer et suivre chaque commande en temps réel',
      createOrder: 'Créer une commande',
      orderNumber: 'Commande #',
      customer: 'Client',
      table: 'Table',
      total: 'Total',
      status: 'Statut',
      created: 'Créé',
      actions: 'Actions',
      statusPending: 'En attente',
      statusPreparing: 'En préparation',
      statusReady: 'Prêt',
      statusCompleted: 'Terminé',
      statusCancelled: 'Annulé',
      typeDineIn: 'Sur place',
      typeTakeaway: 'À emporter',
      typeDelivery: 'Livraison',
    },
    customers: {
      title: 'Clients',
      subtitle: 'Gérer les clients de votre restaurant',
      addCustomer: 'Ajouter un nouveau client',
      customerName: 'Nom du client',
      phone: 'Téléphone',
      email: 'Email',
      status: 'Statut',
      tier: 'Niveau de client',
      totalOrders: 'Commandes totales',
      lastOrder: 'Dernière commande',
      statusActive: 'Actif',
      statusInactive: 'Inactif',
      tierRegular: 'Régulier',
      tierVIP: 'VIP',
      tierNew: 'Nouveau',
    },
    users: {
      title: 'Utilisateurs',
      subtitle: 'Gérer l\'équipe de votre restaurant',
      addUser: 'Ajouter un nouvel utilisateur',
      firstName: 'Prénom',
      lastName: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      status: 'Statut',
      statusActive: 'Actif',
      statusInactive: 'Inactif',
    },
    dashboard: {
      title: 'Tableau de bord',
      subtitle: 'Ventes en direct, commandes, clients et performance du menu',
      totalRevenue: 'Revenus totaux',
      totalOrders: 'Commandes totales',
      customers: 'Clients',
      activeMenuItems: 'Articles de menu actifs',
      today: 'aujourd\'hui',
      salesOverview: 'Aperçu des ventes',
      orderStatus: 'Statut des commandes',
      popularItems: 'Articles populaires',
      recentOrders: 'Commandes récentes',
      performanceMetrics: 'Métriques de performance',
      avgOrderValue: 'Valeur moyenne de commande',
      todaysOrders: 'Commandes du jour',
    },
    validation: {
      required: 'Ce champ est obligatoire',
      email: 'Veuillez entrer une adresse email valide',
      phone: 'Veuillez entrer un numéro de téléphone valide',
      password: 'Le mot de passe doit contenir au moins 8 caractères',
      passwordMatch: 'Les mots de passe ne correspondent pas',
      minLength: 'Doit contenir au moins {min} caractères',
      maxLength: 'Ne doit pas dépasser {max} caractères',
    },
    errors: {
      network: 'Erreur réseau. Veuillez vérifier votre connexion.',
      server: 'Erreur serveur. Veuillez réessayer plus tard.',
      unauthorized: 'Non autorisé. Veuillez vous connecter.',
      forbidden: 'Accès refusé.',
      notFound: 'Ressource non trouvée.',
      validation: 'Erreur de validation. Veuillez vérifier votre saisie.',
      unknown: 'Une erreur inconnue s\'est produite.',
    },
  },
  de: {
    common: {
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      warning: 'Warnung',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      view: 'Anzeigen',
      add: 'Hinzufügen',
      search: 'Suchen',
      filter: 'Filtern',
      export: 'Exportieren',
      refresh: 'Aktualisieren',
      logout: 'Abmelden',
      login: 'Anmelden',
      home: 'Startseite',
      dashboard: 'Dashboard',
      settings: 'Einstellungen',
      profile: 'Profil',
    },
    auth: {
      loginTitle: 'Willkommen zurück',
      loginSubtitle: 'Melden Sie sich in Ihrem Konto an',
      email: 'E-Mail',
      password: 'Passwort',
      forgotPassword: 'Passwort vergessen?',
      resetPassword: 'Passwort zurücksetzen',
      signUp: 'Registrieren',
      signIn: 'Anmelden',
      emailPlaceholder: 'Geben Sie Ihre E-Mail ein',
      passwordPlaceholder: 'Geben Sie Ihr Passwort ein',
      invalidCredentials: 'Ungültige Anmeldedaten',
      loginSuccess: 'Anmeldung erfolgreich',
    },
    navigation: {
      dashboard: 'Dashboard',
      orders: 'Bestellungen',
      tables: 'Tische',
      menu: 'Menü',
      categories: 'Kategorien',
      customers: 'Kunden',
      users: 'Benutzer',
      reports: 'Berichte',
      settings: 'Einstellungen',
    },
    orders: {
      title: 'Bestellungen',
      subtitle: 'Verwalten und verfolgen Sie jede Bestellung in Echtzeit',
      createOrder: 'Bestellung erstellen',
      orderNumber: 'Bestellung #',
      customer: 'Kunde',
      table: 'Tisch',
      total: 'Gesamt',
      status: 'Status',
      created: 'Erstellt',
      actions: 'Aktionen',
      statusPending: 'Ausstehend',
      statusPreparing: 'Wird zubereitet',
      statusReady: 'Bereit',
      statusCompleted: 'Abgeschlossen',
      statusCancelled: 'Storniert',
      typeDineIn: 'Vor Ort',
      typeTakeaway: 'Mitnehmen',
      typeDelivery: 'Lieferung',
    },
    customers: {
      title: 'Kunden',
      subtitle: 'Verwalten Sie Ihre Restaurantkunden',
      addCustomer: 'Neuen Kunden hinzufügen',
      customerName: 'Kundenname',
      phone: 'Telefon',
      email: 'E-Mail',
      status: 'Status',
      tier: 'Kundenstufe',
      totalOrders: 'Gesamtbestellungen',
      lastOrder: 'Letzte Bestellung',
      statusActive: 'Aktiv',
      statusInactive: 'Inaktiv',
      tierRegular: 'Regulär',
      tierVIP: 'VIP',
      tierNew: 'Neu',
    },
    users: {
      title: 'Benutzer',
      subtitle: 'Verwalten Sie Ihr Restaurant-Team',
      addUser: 'Neuen Benutzer hinzufügen',
      firstName: 'Vorname',
      lastName: 'Nachname',
      email: 'E-Mail',
      phone: 'Telefon',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      status: 'Status',
      statusActive: 'Aktiv',
      statusInactive: 'Inaktiv',
    },
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Live-Restaurantumsatz, Bestellungen, Kunden und Menüleistung',
      totalRevenue: 'Gesamtumsatz',
      totalOrders: 'Gesamtbestellungen',
      customers: 'Kunden',
      activeMenuItems: 'Aktive Menüpunkte',
      today: 'heute',
      salesOverview: 'Umsatzübersicht',
      orderStatus: 'Bestellstatus',
      popularItems: 'Beliebte Menüpunkte',
      recentOrders: 'Letzte Bestellungen',
      performanceMetrics: 'Leistungskennzahlen',
      avgOrderValue: 'Durchschnittlicher Bestellwert',
      todaysOrders: 'Heutige Bestellungen',
    },
    validation: {
      required: 'Dieses Feld ist erforderlich',
      email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      phone: 'Bitte geben Sie eine gültige Telefonnummer ein',
      password: 'Das Passwort muss mindestens 8 Zeichen lang sein',
      passwordMatch: 'Passwörter stimmen nicht überein',
      minLength: 'Muss mindestens {min} Zeichen lang sein',
      maxLength: 'Darf {max} Zeichen nicht überschreiten',
    },
    errors: {
      network: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.',
      server: 'Serverfehler. Bitte versuchen Sie es später erneut.',
      unauthorized: 'Nicht autorisiert. Bitte melden Sie sich an.',
      forbidden: 'Zugriff verweigert.',
      notFound: 'Ressource nicht gefunden.',
      validation: 'Validierungsfehler. Bitte überprüfen Sie Ihre Eingabe.',
      unknown: 'Ein unbekannter Fehler ist aufgetreten.',
    },
  },
};

export default translations;
