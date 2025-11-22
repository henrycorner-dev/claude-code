// PauseMenuWidget.h
#pragma once

#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "PauseMenuWidget.generated.h"

/**
 * Example: Pause menu system for Unreal Engine
 * Features: Resume, Settings, Quit, Controller navigation, Animation
 */
UCLASS()
class YOURGAME_API UPauseMenuWidget : public UUserWidget
{
    GENERATED_BODY()

protected:
    // UI Components (bind these in UMG)
    UPROPERTY(meta = (BindWidget))
    class UButton* ResumeButton;

    UPROPERTY(meta = (BindWidget))
    class UButton* SettingsButton;

    UPROPERTY(meta = (BindWidget))
    class UButton* MainMenuButton;

    UPROPERTY(meta = (BindWidget))
    class UButton* QuitButton;

    UPROPERTY(meta = (BindWidget))
    class UCanvasPanel* MenuPanel;

    // Settings
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pause Menu")
    bool bPauseGameWhenOpened = true;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pause Menu")
    bool bShowMouseCursor = true;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pause Menu")
    USoundBase* OpenSound;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pause Menu")
    USoundBase* CloseSound;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pause Menu")
    USoundBase* ButtonHoverSound;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pause Menu")
    USoundBase* ButtonClickSound;

    // Animation
    UPROPERTY(Transient, meta = (BindWidgetAnim))
    UWidgetAnimation* FadeInAnimation;

    UPROPERTY(Transient, meta = (BindWidgetAnim))
    UWidgetAnimation* FadeOutAnimation;

    virtual void NativeConstruct() override;
    virtual void NativeDestruct() override;
    virtual FReply NativeOnKeyDown(const FGeometry& InGeometry, const FKeyEvent& InKeyEvent) override;

private:
    // Button callbacks
    UFUNCTION()
    void OnResumeClicked();

    UFUNCTION()
    void OnSettingsClicked();

    UFUNCTION()
    void OnMainMenuClicked();

    UFUNCTION()
    void OnQuitClicked();

    // Hover callbacks
    UFUNCTION()
    void OnButtonHovered();

    void SetupButtonCallbacks();
    void CleanupButtonCallbacks();

    void PauseGame();
    void ResumeGame();
    void PlayButtonSound(USoundBase* Sound);

    bool bIsClosing = false;

public:
    // Public methods
    UFUNCTION(BlueprintCallable, Category = "Pause Menu")
    void OpenMenu();

    UFUNCTION(BlueprintCallable, Category = "Pause Menu")
    void CloseMenu();

    UFUNCTION(BlueprintCallable, Category = "Pause Menu")
    bool IsMenuOpen() const;
};

// PauseMenuWidget.cpp
#include "PauseMenuWidget.h"
#include "Components/Button.h"
#include "Components/CanvasPanel.h"
#include "Kismet/GameplayStatics.h"
#include "Kismet/KismetSystemLibrary.h"
#include "GameFramework/PlayerController.h"
#include "Sound/SoundBase.h"

void UPauseMenuWidget::NativeConstruct()
{
    Super::NativeConstruct();

    SetupButtonCallbacks();

    // Play open animation
    if (FadeInAnimation)
    {
        PlayAnimation(FadeInAnimation);
    }

    // Play sound
    PlayButtonSound(OpenSound);

    // Set focus to Resume button
    if (ResumeButton)
    {
        ResumeButton->SetKeyboardFocus();
    }
}

void UPauseMenuWidget::NativeDestruct()
{
    CleanupButtonCallbacks();
    Super::NativeDestruct();
}

void UPauseMenuWidget::SetupButtonCallbacks()
{
    if (ResumeButton)
    {
        ResumeButton->OnClicked.AddDynamic(this, &UPauseMenuWidget::OnResumeClicked);
        ResumeButton->OnHovered.AddDynamic(this, &UPauseMenuWidget::OnButtonHovered);
    }

    if (SettingsButton)
    {
        SettingsButton->OnClicked.AddDynamic(this, &UPauseMenuWidget::OnSettingsClicked);
        SettingsButton->OnHovered.AddDynamic(this, &UPauseMenuWidget::OnButtonHovered);
    }

    if (MainMenuButton)
    {
        MainMenuButton->OnClicked.AddDynamic(this, &UPauseMenuWidget::OnMainMenuClicked);
        MainMenuButton->OnHovered.AddDynamic(this, &UPauseMenuWidget::OnButtonHovered);
    }

    if (QuitButton)
    {
        QuitButton->OnClicked.AddDynamic(this, &UPauseMenuWidget::OnQuitClicked);
        QuitButton->OnHovered.AddDynamic(this, &UPauseMenuWidget::OnButtonHovered);
    }
}

void UPauseMenuWidget::CleanupButtonCallbacks()
{
    if (ResumeButton)
    {
        ResumeButton->OnClicked.RemoveDynamic(this, &UPauseMenuWidget::OnResumeClicked);
        ResumeButton->OnHovered.RemoveDynamic(this, &UPauseMenuWidget::OnButtonHovered);
    }

    if (SettingsButton)
    {
        SettingsButton->OnClicked.RemoveDynamic(this, &UPauseMenuWidget::OnSettingsClicked);
        SettingsButton->OnHovered.RemoveDynamic(this, &UPauseMenuWidget::OnButtonHovered);
    }

    if (MainMenuButton)
    {
        MainMenuButton->OnClicked.RemoveDynamic(this, &UPauseMenuWidget::OnMainMenuClicked);
        MainMenuButton->OnHovered.RemoveDynamic(this, &UPauseMenuWidget::OnButtonHovered);
    }

    if (QuitButton)
    {
        QuitButton->OnClicked.RemoveDynamic(this, &UPauseMenuWidget::OnQuitClicked);
        QuitButton->OnHovered.RemoveDynamic(this, &UPauseMenuWidget::OnButtonHovered);
    }
}

FReply UPauseMenuWidget::NativeOnKeyDown(const FGeometry& InGeometry, const FKeyEvent& InKeyEvent)
{
    // Handle ESC or gamepad B/Circle to close menu
    if (InKeyEvent.GetKey() == EKeys::Escape ||
        InKeyEvent.GetKey() == EKeys::Gamepad_FaceButton_Right)
    {
        if (!bIsClosing)
        {
            CloseMenu();
            return FReply::Handled();
        }
    }

    return Super::NativeOnKeyDown(InGeometry, InKeyEvent);
}

void UPauseMenuWidget::OnResumeClicked()
{
    PlayButtonSound(ButtonClickSound);
    CloseMenu();
}

void UPauseMenuWidget::OnSettingsClicked()
{
    PlayButtonSound(ButtonClickSound);
    // TODO: Open settings menu
    // You would typically create a settings widget and add it to viewport
    UE_LOG(LogTemp, Log, TEXT("Settings button clicked"));
}

void UPauseMenuWidget::OnMainMenuClicked()
{
    PlayButtonSound(ButtonClickSound);

    // Confirm dialog (simplified - in production use a proper dialog widget)
    UGameplayStatics::SetGamePaused(GetWorld(), false);
    UGameplayStatics::OpenLevel(GetWorld(), FName("MainMenu"));
}

void UPauseMenuWidget::OnQuitClicked()
{
    PlayButtonSound(ButtonClickSound);

    // Confirm dialog (simplified - in production use a proper dialog widget)
    APlayerController* PC = GetOwningPlayer();
    if (PC)
    {
        UKismetSystemLibrary::QuitGame(GetWorld(), PC, EQuitPreference::Quit, false);
    }
}

void UPauseMenuWidget::OnButtonHovered()
{
    PlayButtonSound(ButtonHoverSound);
}

void UPauseMenuWidget::OpenMenu()
{
    if (bIsClosing)
    {
        return;
    }

    // Pause game
    if (bPauseGameWhenOpened)
    {
        PauseGame();
    }

    // Show mouse cursor
    if (bShowMouseCursor)
    {
        APlayerController* PC = GetOwningPlayer();
        if (PC)
        {
            PC->bShowMouseCursor = true;
            PC->SetInputMode(FInputModeUIOnly());
        }
    }

    // Add to viewport if not already
    if (!IsInViewport())
    {
        AddToViewport(999); // High Z-order
    }

    SetVisibility(ESlateVisibility::Visible);
}

void UPauseMenuWidget::CloseMenu()
{
    if (bIsClosing)
    {
        return;
    }

    bIsClosing = true;

    // Play close animation
    if (FadeOutAnimation)
    {
        PlayAnimation(FadeOutAnimation);

        // Wait for animation to finish before removing
        FTimerHandle TimerHandle;
        GetWorld()->GetTimerManager().SetTimer(TimerHandle, [this]()
        {
            RemoveFromParent();
            bIsClosing = false;
        }, FadeOutAnimation->GetEndTime(), false);
    }
    else
    {
        RemoveFromParent();
        bIsClosing = false;
    }

    // Play sound
    PlayButtonSound(CloseSound);

    // Resume game
    ResumeGame();

    // Hide mouse cursor
    APlayerController* PC = GetOwningPlayer();
    if (PC)
    {
        PC->bShowMouseCursor = false;
        PC->SetInputMode(FInputModeGameOnly());
    }
}

bool UPauseMenuWidget::IsMenuOpen() const
{
    return IsInViewport() && !bIsClosing;
}

void UPauseMenuWidget::PauseGame()
{
    UGameplayStatics::SetGamePaused(GetWorld(), true);
}

void UPauseMenuWidget::ResumeGame()
{
    UGameplayStatics::SetGamePaused(GetWorld(), false);
}

void UPauseMenuWidget::PlayButtonSound(USoundBase* Sound)
{
    if (Sound)
    {
        UGameplayStatics::PlaySound2D(GetWorld(), Sound);
    }
}

/*
 * USAGE EXAMPLE:
 *
 * 1. Create UMG Widget Blueprint:
 *    - Create new Widget Blueprint (WBP_PauseMenu)
 *    - Set parent class to UPauseMenuWidget
 *
 * 2. Design UI in UMG:
 *    Canvas Panel (MenuPanel)
 *      ├─ Background (Image with blur)
 *      └─ Vertical Box
 *          ├─ Text Block (Title: "PAUSED")
 *          ├─ Button (ResumeButton) → "Resume"
 *          ├─ Button (SettingsButton) → "Settings"
 *          ├─ Button (MainMenuButton) → "Main Menu"
 *          └─ Button (QuitButton) → "Quit Game"
 *
 * 3. Create Animations:
 *    - FadeInAnimation: Opacity 0 → 1 (0.3s)
 *    - FadeOutAnimation: Opacity 1 → 0 (0.2s)
 *
 * 4. In Player Controller:
 *    - Handle pause input (ESC or Start button)
 *
 *    // PlayerController.h
 *    UPROPERTY(EditDefaultsOnly, Category = "UI")
 *    TSubclassOf<UPauseMenuWidget> PauseMenuClass;
 *
 *    UPROPERTY()
 *    UPauseMenuWidget* PauseMenu;
 *
 *    // PlayerController.cpp
 *    void AMyPlayerController::SetupInputComponent()
 *    {
 *        Super::SetupInputComponent();
 *        InputComponent->BindAction("Pause", IE_Pressed, this, &AMyPlayerController::TogglePause);
 *    }
 *
 *    void AMyPlayerController::TogglePause()
 *    {
 *        if (!PauseMenu)
 *        {
 *            PauseMenu = CreateWidget<UPauseMenuWidget>(this, PauseMenuClass);
 *        }
 *
 *        if (PauseMenu->IsMenuOpen())
 *        {
 *            PauseMenu->CloseMenu();
 *        }
 *        else
 *        {
 *            PauseMenu->OpenMenu();
 *        }
 *    }
 *
 * TIPS:
 * - Use Blur widget for background (Settings → Blur Strength)
 * - Add hover animations in UMG (scale up on hover)
 * - Use consistent button styling
 * - Add sound cues for better feedback
 * - Test with both keyboard and gamepad
 * - Add confirmation dialogs for destructive actions (Quit, Main Menu)
 * - Consider adding a "How to Play" or "Controls" option
 */
