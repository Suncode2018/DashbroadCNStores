# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


##################
✨ ฟีเจอร์หลัก
🔐 ระบบ Authentication

ไม่ต้อง Login เพื่อดู Dashboard
บังคับ Login เฉพาะตอน Export ข้อมูล
Profile management พร้อม avatar

🎨 UI/UX Design

Modern & Clean Design ใช้ Tailwind CSS
Responsive Design รองรับทุกขนาดหน้าจอ
ธีมสีน้ำเงิน-ส้ม สวยงามและเป็นมิตรกับผู้ใช้
Smooth Animations และ transitions

📊 Dashboard Components

Navbar - แสดง logo, profile menu
Sidebar - เมนูนำทางหลัก (แดชบอร์ด, สาขา, ยอดขาย, รายงาน)
Dashboard - แสดงข้อมูลสรุปและยอดขายแต่ละสาขา
Export Function - ปุ่ม Export ที่จะเปิด Login dialog หากยังไม่ได้ล็อกอิน

📱 Components Structure

Navbar.js - Navigation bar พร้อม user menu
SideDrawer.js - Responsive sidebar menu
LoginDialog.js - Modal สำหรับล็อกอิน
ProfileDialog.js - แสดงข้อมูลผู้ใช้
Dashboard.js - หน้าหลักแสดงข้อมูล

🎯 User Experience

Guest Access - ดูข้อมูล Dashboard ได้ทันที
Smart Login Flow - บังคับ Login เฉพาะเวลาจำเป็น
Visual Feedback - แสดงสถานะการ Export
Thai Language - ใช้ภาษาไทยทั้งหมด

📈 ข้อมูลที่แสดง

ยอดขายรวมทุกสาขา
อัตราการเติบโตเฉลี่ย
ข้อมูลแต่ละสาขา (เซ็นทรัล, สยาม, อโศก, สีลม)
สถิติการเติบโตแบบ real-time

######################################
