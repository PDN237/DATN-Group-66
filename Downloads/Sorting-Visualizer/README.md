# Sorting Visualizer

#### Video Demo: [https://youtu.be/mFuDlAwjrl0](https://youtu.be/mFuDlAwjrl0)

#### Link Demo: []
#### Description:
An interactive web application that brings sorting algorithms to life through dynamic visualizations, transforming abstract concepts into engaging, real-time animations.

---

## 📌 Project Overview

**Sorting Visualizer** is an educational web tool that demonstrates sorting algorithms visually. Users can watch algorithms like Bubble Sort and Quick Sort in action, seeing how elements compare, swap, and arrange themselves into order through smooth animations.

Key capabilities include:
- Generating random arrays of numbers (1-1000)
- Selecting from multiple sorting algorithms
- Adjusting visualization speed and element count
- Switching between different display modes (boxes, bars, sized boxes)
- Viewing algorithm implementations in various programming languages
- Experimenting with custom sorting code in the built-in editor

---

## 🌟 Key Features

- **Dynamic Array Generation:**
  Create arrays with 5-100 random integers (1-1000), represented as visual elements that animate during sorting.

- **Multiple Visualization Modes:**
  - **Boxes:** Traditional numbered squares that rearrange horizontally
  - **Bars:** Vertical bars where height represents value
  - **Sized Boxes:** Squares where size indicates value

- **Supported Algorithms:**
  - Bubble Sort (O(n²))
  - Selection Sort (O(n²))
  - Insertion Sort (O(n²))
  - Quick Sort (O(n log n) average)
  - Merge Sort (O(n log n))

- **Interactive Controls:**
  - Element count: 5-100
  - Speed multiplier: 0.25x to 4x
  - Algorithm selection
  - Visualization mode switching
  - Randomize and Sort buttons

- **Code Learning Tools:**
  - Syntax-highlighted implementations in C, C#, Java, Python, and JavaScript
  - Interactive code editor for experimenting with custom algorithms
  - Detailed algorithm descriptions

- **Responsive Design:**
  Built with modern CSS, featuring a dark theme, smooth animations, and mobile-friendly layouts. No external libraries required for core functionality.

---

## 📂 Project Structure

```
sorting-visualizer/
├── index.html          # Main HTML structure and layout
├── css/
│   └── style.css       # Styling, animations, and responsive design
└── js/
    ├── app.js          # Main application logic and UI management
    └── sort.js         # Sorting algorithm implementations with visualization
```

### `index.html`
The foundation of the application:
- Header with control panels for algorithm selection, speed, elements, and visualization mode
- Main visualization area where elements are rendered and animated
- Algorithm description section with code viewer and editor
- Footer with attribution
- External script loading for Prism.js syntax highlighting

### `css/style.css`
Comprehensive styling including:
- Dark gradient theme with glassmorphism effects
- Element styling for boxes, bars, and sized boxes with state-based colors (comparing: red, swapping: orange, sorted: green)
- Smooth CSS transitions and keyframe animations
- Responsive breakpoints for desktop, tablet, and mobile
- Custom scrollbar and focus states

### `js/app.js`
Core application controller featuring:
- Array generation and element rendering with random positioning
- Event handling for all user controls
- Sorting process management with state tracking
- Dynamic UI updates during algorithm execution
- Code viewer tab switching and syntax highlighting integration
- Visualization mode switching logic

### `js/sort.js`
Algorithm visualization engine:
- `SortVisualizer` class implementing each sorting algorithm
- Async/await pattern for controlled animation timing
- Step-by-step UI updates for comparisons and swaps
- Support for stopping mid-execution
- Modular design for easy algorithm addition

---

## 🧠 Design Decisions

1. **Pure JavaScript Implementation:**
   No frameworks or libraries for core functionality to demonstrate fundamental web development concepts and ensure lightweight performance.

2. **Async Animation Control:**
   Leverages modern JavaScript async/await with Promises for clean, sequential animation steps instead of complex callback chains.

3. **Progressive Enhancement:**
   Starts with scattered elements representing "chaos" that smoothly transition to ordered arrangements, making the sorting process intuitively visible.

4. **Modular Architecture:**
   Clear separation between UI logic, styling, and algorithm implementations for maintainability and extensibility.

5. **Educational Focus:**
   Prioritizes visual clarity and step-by-step demonstration over raw performance, making it ideal for learning algorithm behavior.

6. **Accessibility Considerations:**
   Semantic HTML structure, keyboard navigation support, and responsive design for broader usability.

---

## 🧪 Testing

Manual testing conducted across:
- **Browsers:** Chrome, Firefox, Edge
- **Devices:** Desktop computers
- **Scenarios:** Various element counts (5-100), all algorithms, speed settings, and visualization modes

All sorting algorithms execute correctly with proper visual feedback. Animations remain smooth during execution, and the interface stays responsive across different configurations.

---

## 🚀 Getting Started

1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. Adjust settings and click "Randomize" to generate an array
4. Select an algorithm and click "Sort" to begin visualization
5. Explore different modes and experiment with the code editor

No build process or server required - runs entirely in the browser.

---

## 👨‍💻 Author

- **GitHub:** [PDN237](https://github.com/PDN237)
- **Email:** binbokhoa123@gmail.com
- **Team:** MN-Team

Inspired by [dharshakch97/sort-visualizer](https://github.com/dharshakch97/sort-visualizer)

---

## 📝 License

Developed for educational purposes. Feel free to explore, modify, and learn from this codebase.
