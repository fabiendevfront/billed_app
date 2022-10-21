![logo](src/assets/images/logoreadme.png)

# Projet P9 - Débuggez et testez un SaaS RH

Projet réalisé dans le cadre du parcours de développeur d'application Javascript React d'OpenClassrooms.

## Languages & outils

* JavaScript
* [Jest](https://jestjs.io/fr/) - Framework de test JavaScript
* [Testing Library](https://testing-library.com/) - Bibliothèque d'utilitaires de test
* Chrome Debugger
* Node.js & NPM - Pour l'installation et configuration du projet
* GIT - Gestion de versions
* [GitHub](https://github.com/) - Hébergement en ligne des dépôts GIT
* [Visual Studio Code](https://code.visualstudio.com/) - Éditeur de code
* [Notion](https://www.notion.so/) - Suivi de projet

## Ressources

* [Description de la fonctionnalité](https://s3.eu-west-1.amazonaws.com/course.oc-static.com/projects/DA+JSR_P9/Billed+-+Description+des+fonctionnalite%CC%81s.pdf)
* [Backend](https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-back)
* [Frontend](https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Front)
* [Description pratique des besoins](https://course.oc-static.com/projects/DA+JSR_P9/Billed+-+Description+pratique+des+besoins+-.pdf)
* [Kanban Notion](https://www.notion.so/a7a612fc166747e78d95aa38106a55ec?v=2a8d3553379c4366b6f66490ab8f0b90)
* [Exemple de plan de test E2E](https://course.oc-static.com/projects/DA+JSR_P9/Billed+-+E2E+parcours+administrateur.docx)

## Identité

Billed est une entreprise qui produit des solutions SaaS destinées aux équipes de ressources humaines.

## Contexte

Dans deux semaines, l’équipe doit lancer officiellement la solution auprès des clients. Les délais sont donc très serrés.
J’étais chargé de fiabiliser et améliorer le parcours employé.
Pour cela je devais corriger les bugs restants, mettre en place les tests manquants et rédiger un plan de test E2E.

## Compétences évaluées

* Débugger une application web
* Ecrire des tests unitaires avec JavaScript
* Ecrire des tests d'intégration avec JavaScript
* Rédiger un plan de test E2E


## Livrables

* Un fichier au format TXT contenant le lien vers le code à jour sur un repo GitHub public.
* Un screenshot au format PNG du rapport de tests Jest sur l’ensemble des fichiers d’UI (src/views) et des fichiers d’UX (src/containers).
* Un screenshot au format PNG du rapport de couverture Jest.
* Un document au format PDF du plan de tests End-To-End pour le parcours employé.

## Installation du projet

### L'architecture du projet :
Ce projet, dit frontend, est connecté à un service API backend que vous devez aussi lancer en local.

Le projet backend se trouve ici: https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-back

### Organiser son espace de travail :
Pour une bonne organization, vous pouvez créer un dossier bill-app dans lequel vous allez cloner le projet backend et par la suite, le projet frontend:

Clonez le projet backend dans le dossier bill-app :
```
$ git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Back.git
```

```
bill-app/
   - Billed-app-FR-Back
```

Clonez le projet frontend dans le dossier bill-app :
```
$ git clone https://github.com/OpenClassrooms-Student-Center/Billed-app-FR-Front.git
```

```
bill-app/
   - Billed-app-FR-Back
   - Billed-app-FR-Front
```

## Comment lancer l'application en local ?

### étape 1 - Lancer le backend :

Suivez les indications dans le README du projet backend.

### étape 2 - Lancer le frontend :

Allez au repo cloné :
```
$ cd Billed-app-FR-Front
```

Installez les packages npm (décrits dans `package.json`) :
```
$ npm install
```

Installez live-server pour lancer un serveur local :
```
$ npm install -g live-server
```

Lancez l'application :
```
$ live-server
```

Puis allez à l'adresse : `http://127.0.0.1:8080/`


## Comment lancer tous les tests en local avec Jest ?

```
$ npm run test
```

## Comment lancer un seul test ?

Installez jest-cli :

```
$npm i -g jest-cli
$jest src/__tests__/your_test_file.js
```

## Comment voir la couverture de test ?

`http://127.0.0.1:8080/coverage/lcov-report/`

## Comptes et utilisateurs :

Vous pouvez vous connecter en utilisant les comptes:

### administrateur : 
```
utilisateur : admin@test.tld 
mot de passe : admin
```
### employé :
```
utilisateur : employee@test.tld
mot de passe : employee
```
