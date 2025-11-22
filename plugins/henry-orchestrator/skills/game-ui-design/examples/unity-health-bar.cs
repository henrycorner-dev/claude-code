using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Example: Animated health bar with damage feedback for Unity
/// Features: Smooth lerp animation, color gradients, damage flash, text display
/// </summary>
public class HealthBar : MonoBehaviour
{
    [Header("UI References")]
    [SerializeField] private Image healthBarFill;
    [SerializeField] private Image damageBarFill; // Shows recent damage
    [SerializeField] private TextMeshProUGUI healthText;
    [SerializeField] private CanvasGroup canvasGroup;

    [Header("Health Settings")]
    [SerializeField] private float maxHealth = 100f;
    [SerializeField] private float currentHealth = 100f;

    [Header("Animation Settings")]
    [SerializeField] private float lerpSpeed = 5f;
    [SerializeField] private float damageBarDelay = 0.5f;
    [SerializeField] private float damageBarSpeed = 2f;

    [Header("Visual Settings")]
    [SerializeField] private Gradient healthGradient;
    [SerializeField] private bool useGradient = true;
    [SerializeField] private Color damageFlashColor = Color.red;
    [SerializeField] private float flashDuration = 0.2f;

    [Header("Visibility Settings")]
    [SerializeField] private bool autoHide = true;
    [SerializeField] private float autoHideDelay = 3f;
    [SerializeField] private float fadeSpeed = 2f;

    private float targetFillAmount;
    private float damageFillAmount;
    private float damageBarTimer;
    private float autoHideTimer;
    private bool isFlashing;
    private Color originalColor;

    private void Awake()
    {
        if (healthBarFill != null)
        {
            originalColor = healthBarFill.color;
        }

        // Initialize
        currentHealth = maxHealth;
        UpdateHealthBar();
    }

    private void Update()
    {
        // Smooth lerp to target health
        if (healthBarFill.fillAmount != targetFillAmount)
        {
            healthBarFill.fillAmount = Mathf.Lerp(
                healthBarFill.fillAmount,
                targetFillAmount,
                Time.deltaTime * lerpSpeed
            );

            UpdateHealthColor();
        }

        // Update damage bar (delayed)
        if (damageBarFill != null)
        {
            if (damageBarTimer > 0)
            {
                damageBarTimer -= Time.deltaTime;
            }
            else if (damageFillAmount > targetFillAmount)
            {
                damageFillAmount = Mathf.Lerp(
                    damageFillAmount,
                    targetFillAmount,
                    Time.deltaTime * damageBarSpeed
                );
                damageBarFill.fillAmount = damageFillAmount;
            }
        }

        // Auto-hide logic
        if (autoHide && canvasGroup != null)
        {
            if (autoHideTimer > 0)
            {
                autoHideTimer -= Time.deltaTime;
                canvasGroup.alpha = Mathf.Lerp(canvasGroup.alpha, 1f, Time.deltaTime * fadeSpeed);
            }
            else
            {
                canvasGroup.alpha = Mathf.Lerp(canvasGroup.alpha, 0f, Time.deltaTime * fadeSpeed);
            }
        }
    }

    /// <summary>
    /// Set current health and update the UI
    /// </summary>
    public void SetHealth(float health)
    {
        currentHealth = Mathf.Clamp(health, 0f, maxHealth);
        UpdateHealthBar();
    }

    /// <summary>
    /// Apply damage to health
    /// </summary>
    public void TakeDamage(float damage)
    {
        currentHealth = Mathf.Max(0, currentHealth - damage);
        UpdateHealthBar();
        FlashDamage();

        // Reset damage bar timer
        damageBarTimer = damageBarDelay;

        // Reset auto-hide timer
        if (autoHide)
        {
            autoHideTimer = autoHideDelay;
        }
    }

    /// <summary>
    /// Heal the player
    /// </summary>
    public void Heal(float amount)
    {
        currentHealth = Mathf.Min(maxHealth, currentHealth + amount);
        UpdateHealthBar();

        // Reset auto-hide timer
        if (autoHide)
        {
            autoHideTimer = autoHideDelay;
        }
    }

    /// <summary>
    /// Update the health bar UI
    /// </summary>
    private void UpdateHealthBar()
    {
        targetFillAmount = currentHealth / maxHealth;

        // Update damage bar fill (shows where health was before damage)
        if (damageBarFill != null && damageFillAmount < targetFillAmount)
        {
            damageFillAmount = targetFillAmount;
            damageBarFill.fillAmount = damageFillAmount;
        }

        // Update text
        if (healthText != null)
        {
            healthText.text = $"{Mathf.CeilToInt(currentHealth)} / {Mathf.CeilToInt(maxHealth)}";
        }

        UpdateHealthColor();
    }

    /// <summary>
    /// Update health bar color based on health percentage
    /// </summary>
    private void UpdateHealthColor()
    {
        if (healthBarFill != null && useGradient && !isFlashing)
        {
            float healthPercent = healthBarFill.fillAmount;
            healthBarFill.color = healthGradient.Evaluate(healthPercent);
        }
    }

    /// <summary>
    /// Flash red when taking damage
    /// </summary>
    private void FlashDamage()
    {
        if (healthBarFill != null && !isFlashing)
        {
            StartCoroutine(DamageFlashCoroutine());
        }
    }

    private System.Collections.IEnumerator DamageFlashCoroutine()
    {
        isFlashing = true;

        // Flash to damage color
        healthBarFill.color = damageFlashColor;

        yield return new WaitForSeconds(flashDuration);

        // Return to original/gradient color
        isFlashing = false;
        UpdateHealthColor();
    }

    /// <summary>
    /// Set maximum health
    /// </summary>
    public void SetMaxHealth(float newMaxHealth)
    {
        float healthPercent = currentHealth / maxHealth;
        maxHealth = newMaxHealth;
        currentHealth = maxHealth * healthPercent;
        UpdateHealthBar();
    }

    /// <summary>
    /// Get current health percentage (0-1)
    /// </summary>
    public float GetHealthPercent()
    {
        return currentHealth / maxHealth;
    }

    /// <summary>
    /// Check if health is critical (below threshold)
    /// </summary>
    public bool IsCritical(float threshold = 0.25f)
    {
        return GetHealthPercent() <= threshold;
    }

    /// <summary>
    /// Force show the health bar
    /// </summary>
    public void Show()
    {
        if (canvasGroup != null)
        {
            autoHideTimer = autoHideDelay;
        }
    }

    /// <summary>
    /// Force hide the health bar
    /// </summary>
    public void Hide()
    {
        if (canvasGroup != null)
        {
            autoHideTimer = 0;
        }
    }

#if UNITY_EDITOR
    // Test in editor
    private void OnValidate()
    {
        if (Application.isPlaying)
        {
            UpdateHealthBar();
        }
    }
#endif
}

/*
 * USAGE EXAMPLE:
 *
 * 1. Create UI hierarchy:
 *    Canvas
 *      └─ HealthBarPanel
 *          ├─ Background (Image)
 *          ├─ DamageBar (Image) - Red, behind health bar
 *          ├─ HealthBar (Image) - Green to red gradient
 *          └─ HealthText (TextMeshPro)
 *
 * 2. Attach this script to HealthBarPanel
 *
 * 3. Assign references in Inspector:
 *    - Health Bar Fill: The HealthBar Image
 *    - Damage Bar Fill: The DamageBar Image
 *    - Health Text: The TextMeshPro component
 *    - Canvas Group: Add CanvasGroup to panel for fading
 *
 * 4. Configure gradient:
 *    - Create gradient: Green (100%) → Yellow (50%) → Red (0%)
 *
 * 5. Use in code:
 *    healthBar.TakeDamage(25f);
 *    healthBar.Heal(10f);
 *    healthBar.SetHealth(75f);
 *
 * TIPS:
 * - Use Canvas Scaler set to "Scale With Screen Size" for responsive design
 * - Anchor health bar to top-left corner
 * - Add outline or shadow to text for readability
 * - Consider adding sound effects on damage/heal
 * - For multiplayer, use separate health bars above characters (world-space canvas)
 */
