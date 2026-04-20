        console.log('Inicio de test (main.js)');
        import { Nodo } from './index.js';
        // Función benchmark mejorada
        function benchmark(etiqueta, callback) {
            const inicioTiempo = performance.now();
            const inicioMem = performance.memory ? performance.memory.usedJSHeapSize : 0;

            const resultado = callback();

            const finTiempo = performance.now();
            const finMem = performance.memory ? performance.memory.usedJSHeapSize : 0;

            const tiempo = (finTiempo - inicioTiempo);
            const memoria = (finMem - inicioMem) / 1024; // KB

            return {
                etiqueta,
                tiempo: tiempo.toFixed(3),
                memoria: memoria.toFixed(2),
                resultado
            };
        }


        // Función para probar con diferentes cantidades
        function probarCreacionNodos(cantidad) {
            return benchmark(`Crear ${cantidad.toLocaleString()} nodos`, () => {
                const nodos = Nodo.crear();
                for (let i = 0; i < cantidad; i++) {
                    const nodo = Nodo.crear_con_dato_e_id(`dato_${i}`, `${cantidad.toLocaleString()}id${i}`);
                    nodos._adyacente_en(nodo, `camino_${i}`);
                                }
                alert("22");
                console.log("lllllLLLL");
                return nodos;
            });
        }

        // Ejecutar todas las pruebas
        window.runAllTests = async function() {
            const resultsContainer = document.getElementById('results');
           // alert("resultsContainer");
            resultsContainer.innerHTML = '<p class="loading">Ejecutando pruebas... Esto puede tomar unos segundos.</p>';

            // Usar setTimeout para permitir que la UI se actualice
            setTimeout(() => {
                const cantidades = [1000, 10000, 100000, 200000,1000000];
                const resultados = [];

                try {
                    for (const cantidad of cantidades) {
                        const resultado = probarCreacionNodos(cantidad);
                        resultados.push(resultado);
                        
                        // Mostrar progreso
                        const progress = ((cantidades.indexOf(cantidad) + 1) / cantidades.length * 100).toFixed(0);
                        resultsContainer.innerHTML = `
                            <p class="loading">Progreso: ${progress}% - Probando con ${cantidad.toLocaleString()} nodos...</p>
                        `;
                    }

                    // Mostrar todos los resultados
                    mostrarResultados(resultados);
                    
                } catch (error) {
                    resultsContainer.innerHTML = `
                        <div style="color: red; background: #ffe6e6; padding: 10px; border-radius: 5px;">
                            <strong>Error:</strong> ${error.message}
                        </div>
                    `;
                    console.error('Error en las pruebas:', error);
                }
            }, 100);
        }

        // Mostrar resultados en el HTML
        function mostrarResultados(resultados) {
            const resultsContainer = document.getElementById('results');
            let html = '<h3>Resultados del Benchmark:</h3>';
            
            resultados.forEach(result => {
                html += `
                    <div class="result-item">
                        <strong>${result.etiqueta}</strong><br>
                        Tiempo: ${result.tiempo} ms | 
                        Memoria: ${result.memoria} KB
                    </div>
                `;
            });

            // Agregar información del sistema
            html += `
                <div style="margin-top: 15px; padding: 10px; background: #e9ecef; border-radius: 4px; font-size: 12px;">
                    <strong>Información del navegador:</strong><br>
                    User Agent: ${navigator.userAgent}<br>
                    Memoria disponible: ${performance.memory ? 'Sí' : 'No'}
                </div>
            `;

            resultsContainer.innerHTML = html;
        }

        // Limpiar resultados
         window.clearResults = function() {
            document.getElementById('results').innerHTML = 
                '<p>Haz clic en "Ejecutar Todas las Pruebas" para comenzar...</p>';
            
            // Forzar garbage collection si está disponible
            if (window.gc) {
                window.gc();
            }
        }

        // Versión alternativa si quieres probar con async/await para no bloquear la UI
        async function runAllTestsAsync() {
            const resultsContainer = document.getElementById('results');
            resultsContainer.innerHTML = '<p class="loading">Ejecutando pruebas de forma asíncrona...</p>';

            const cantidades = [1000, 10000, 100000, 200000, 1000000];
            const resultados = [];

            for (const cantidad of cantidades) {
                // Usar setTimeout para permitir que la UI se actualice entre pruebas
                await new Promise(resolve => setTimeout(resolve, 100));
                
                const resultado = probarCreacionNodos(cantidad);
                resultados.push(resultado);
                
                // Mostrar progreso
                const progress = ((cantidades.indexOf(cantidad) + 1) / cantidades.length * 100).toFixed(0);
                resultsContainer.innerHTML = `
                    <p class="loading">Progreso: ${progress}% - Completado: ${cantidad.toLocaleString()} nodos</p>
                `;
            }

            mostrarResultados(resultados);
        }