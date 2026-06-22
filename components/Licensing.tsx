export function Licensing() {
  return (
    <section id="licensing" className="section">
      <div className="sec-label">licensing</div>
      <h2 className="sec-h2">Open source for research. Commercial for proprietary use.</h2>
      <p className="sec-sub">
        Drift is dual-licensed. Choose the license that matches how you deploy and distribute the platform.
      </p>

      <div className="license-grid">
        <div className="license-card">
          <div className="license-tag">open source</div>
          <h3>GNU AGPL-3.0</h3>
          <p>
            Use, modify, and distribute Drift under the GNU Affero General Public License v3.0,
            including for research, academic, and open-source work.
          </p>
          <p>
            If you modify Drift and provide it to others over a network, you must release the
            complete corresponding source of your modified version under the same license.
          </p>
          <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noreferrer">
            Read the AGPL-3.0 license ↗
          </a>
        </div>

        <div className="license-card license-card-commercial">
          <div className="license-tag">commercial</div>
          <h3>Proprietary deployment</h3>
          <p>
            A separate commercial license is available if you cannot or do not wish to comply
            with AGPL-3.0, including deployment inside proprietary products or services without
            releasing your own source.
          </p>
          <p>
            Commercial terms can also cover production support, SLA, and proprietary premium
            components. This summary is not the commercial license agreement.
          </p>
          <a href="mailto:shekhawatsamvardhan@gmail.com">
            Request commercial terms →
          </a>
        </div>
      </div>
    </section>
  )
}
